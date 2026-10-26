import { EstadoInscripcion, EstadoPago, EstadoTorneo, MedioPago, MotivoRevision, Prisma, Vinculacion } from '@prisma/client';
import type { DatosPagoSimulado, EstadoDeLaInscripcion, InicioDePago, InscripcionParaPagar } from '@setpoint/shared';
import { enviarCorreo } from '../../lib/correo';
import { consultarPago, crearPreferencia, hayMercadoPago } from '../../lib/mercadopago';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { esPosibleHomonimo } from '../inscripcion/busqueda';
import { estadoDe } from '../inscripcion/estados';
import { ocupanCupo } from '../inscripcion/inscripcion.service';
import { descartarPerfil, entrarAlPadron } from '../inscripcion/perfil-pendiente';
import { comprobante } from './comprobante';

// El pago de la inscripción (F12, 05-pagos.md): iniciar el checkout, confirmar con el webhook y
// mandar el comprobante. La confirmación viene siempre del webhook, nunca de la vuelta del checkout.

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';
// La dirección pública de la API, para que MercadoPago avise. Sin ella no hay webhook (en
// desarrollo, ngrok).
const API_URL_PUBLICA = process.env.API_URL_PUBLICA;

const CON_TORNEO = {
  torneo: { include: { categoria: true, organizacion: true } },
  jugador: true,
  usuario: true,
} satisfies Prisma.InscripcionInclude;

// La inscripción de esta persona: la que reservó, o la de su perfil ya vinculado.
async function inscripcionDe(slug: string, inscripcionId: number, usuarioId: number) {
  if (!Number.isInteger(inscripcionId)) throw new ErrorHttp(404, 'INSCRIPCION_NO_ENCONTRADA');
  const inscripcion = await prisma.inscripcion.findFirst({
    where: {
      id: inscripcionId,
      torneo: { organizacion: { slug } },
      OR: [{ usuarioId }, { jugador: { usuarioId } }],
    },
    include: CON_TORNEO,
  });
  if (!inscripcion) throw new ErrorHttp(404, 'INSCRIPCION_NO_ENCONTRADA');
  return inscripcion;
}


export async function inscripcionParaPagar(slug: string, inscripcionId: number, usuarioId: number): Promise<InscripcionParaPagar> {
  const inscripcion = await inscripcionDe(slug, inscripcionId, usuarioId);
  const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  const { torneo } = inscripcion;
  return {
    id: inscripcion.id,
    estado: estadoDe(inscripcion),
    reservaVence: inscripcion.reservaVence?.toISOString() ?? null,
    torneo: {
      id: torneo.id,
      nombre: torneo.edicion ?? torneo.nombre,
      categoria: torneo.categoria.nombre,
      organizacion: { nombre: torneo.organizacion.nombre, slug: torneo.organizacion.slug },
    },
    jugador: { nombre: inscripcion.jugador.nombre, apellido: inscripcion.jugador.apellido },
    precio: torneo.precio.toNumber(),
    email: usuario.email,
    pagoSimulado: !hayMercadoPago(),
  };
}

// La solicitud aprobada reserva el lugar recién cuando se abre el link para pagar (07 §2.6): la
// reserva corre desde ahí, con los mismos minutos que cualquier otra.
export async function reservarAprobada(slug: string, inscripcionId: number, usuarioId: number): Promise<InscripcionParaPagar> {
  const inscripcion = await inscripcionDe(slug, inscripcionId, usuarioId);
  if (inscripcion.estado !== EstadoInscripcion.APROBADA) throw new ErrorHttp(409, 'NO_ESTA_APROBADA');
  const { torneo } = inscripcion;
  if (torneo.estado !== EstadoTorneo.PUBLICADO) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');

  try {
    await prisma.$transaction(
      async (tx) => {
        const ahora = new Date();
        const ocupados = await tx.inscripcion.count({ where: { torneoId: torneo.id, ...ocupanCupo(ahora) } });
        if (ocupados >= torneo.cupo) throw new ErrorHttp(409, 'SIN_LUGARES');
        await tx.inscripcion.updateMany({
          where: { id: inscripcion.id, estado: EstadoInscripcion.APROBADA },
          data: {
            estado: EstadoInscripcion.PENDIENTE_PAGO,
            reservaVence: new Date(ahora.getTime() + torneo.minutosReservaCupo * 60_000),
          },
        });
      },
      // Como al reservar: dos reservas simultáneas no pasan las dos el chequeo del cupo.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new ErrorHttp(409, 'CONFLICTO');
    throw error;
  }
  return inscripcionParaPagar(slug, inscripcionId, usuarioId);
}

// Abre el checkout de una reserva vigente. Sin credenciales, el pago es simulado (decisión 053).
export async function iniciarPago(slug: string, inscripcionId: number, usuarioId: number): Promise<InicioDePago> {
  const inscripcion = await inscripcionDe(slug, inscripcionId, usuarioId);
  if (estadoDe(inscripcion) !== 'reservando') throw new ErrorHttp(409, 'RESERVA_NO_VIGENTE');

  const { torneo } = inscripcion;
  const precio = torneo.precio.toNumber();

  // Un torneo gratis no pasa por MercadoPago.
  if (precio === 0) {
    await confirmarPago(inscripcion.id, { medio: MedioPago.OTRO, monto: 0 });
    return { url: null };
  }
  if (!hayMercadoPago()) return { url: null };

  const vuelta = `${WEB_URL}/c/${slug}/inscripciones/${inscripcion.id}`;
  const preferencia = await crearPreferencia({
    inscripcionId: inscripcion.id,
    titulo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    precio,
    vuelta,
    webhook: API_URL_PUBLICA ? `${API_URL_PUBLICA}/api/webhooks/mercadopago` : null,
    vence: inscripcion.reservaVence ?? new Date(Date.now() + torneo.minutosReservaCupo * 60_000),
  });

  await prisma.pago.upsert({
    where: { inscripcionId: inscripcion.id },
    create: { inscripcionId: inscripcion.id, monto: precio, mpPreferenceId: preferencia.id },
    update: { mpPreferenceId: preferencia.id, estado: EstadoPago.PENDIENTE },
  });

  return { url: preferencia.url };
}

type PagoRecibido = {
  medio: MedioPago;
  monto: number;
  mpPaymentId?: string;
  payload?: Prisma.InputJsonValue;
};

// Confirma el pago: la inscripción pasa a pagada, se guarda la vinculación del perfil (decisión
// 051) y sale el comprobante. Idempotente: MercadoPago reenvía notificaciones, y una inscripción ya
// pagada no se toca ni manda otro comprobante.
export async function confirmarPago(inscripcionId: number, pago: PagoRecibido) {
  const confirmada = await prisma.$transaction(async (tx) => {
    const inscripcion = await tx.inscripcion.findUnique({ where: { id: inscripcionId }, include: CON_TORNEO });
    if (!inscripcion || inscripcion.estado === EstadoInscripcion.PAGADA) return null;

    // Si llega aprobado después de vencer la reserva, se confirma igual: el jugador ya pagó. La
    // preferencia vence con la reserva, así que no debería pasar.
    const pagadoEn = new Date();
    // MercadoPago avisa el mismo pago más de una vez, y a veces a la vez. El cambio de estado lleva
    // la condición: el segundo aviso espera el bloqueo de la fila, ya la encuentra pagada y no sigue.
    // Así el comprobante sale una sola vez.
    const { count } = await tx.inscripcion.updateMany({
      where: { id: inscripcion.id, estado: { not: EstadoInscripcion.PAGADA } },
      data: { estado: EstadoInscripcion.PAGADA, reservaVence: null },
    });
    if (count === 0) return null;
    await tx.pago.upsert({
      where: { inscripcionId: inscripcion.id },
      create: {
        inscripcionId: inscripcion.id,
        medio: pago.medio,
        estado: EstadoPago.APROBADO,
        monto: pago.monto,
        mpPaymentId: pago.mpPaymentId,
        payloadCrudo: pago.payload,
      },
      update: { medio: pago.medio, estado: EstadoPago.APROBADO, monto: pago.monto, mpPaymentId: pago.mpPaymentId, payloadCrudo: pago.payload },
    });

    await vincularAlPagar(tx, inscripcion);
    // Quien no estaba en el padrón entra ahora (decisión 054).
    await entrarAlPadron(tx, inscripcion.jugador, inscripcion.usuarioId);

    const usuarioId = inscripcion.usuarioId ?? inscripcion.jugador.usuarioId;
    const usuario = usuarioId ? await tx.usuario.findUnique({ where: { id: usuarioId } }) : null;
    return { inscripcion, usuario, pagadoEn };
  });

  if (confirmada?.usuario) {
    const { inscripcion, usuario, pagadoEn } = confirmada;
    const { torneo } = inscripcion;
    const correo = comprobante({
      inscripcionId: inscripcion.id,
      jugador: `${inscripcion.jugador.nombre} ${inscripcion.jugador.apellido}`,
      torneo: torneo.edicion ?? torneo.nombre,
      categoria: torneo.categoria.nombre,
      organizacion: torneo.organizacion.nombre,
      monto: pago.monto,
      pagadoEn,
      linkDelTorneo: `${WEB_URL}/c/${torneo.organizacion.slug}/torneos/${torneo.id}`,
    });
    void enviarCorreo({ para: usuario.email, ...correo }).catch((error) => console.error('No se pudo mandar el comprobante', error));
  }
}

type InscripcionConTorneo = Prisma.InscripcionGetPayload<{ include: typeof CON_TORNEO }>;

// La vinculación se guarda recién con el pago (decisión 051). Si eligió un perfil con otro igual o
// parecido en la categoría, queda para que lo revise la organización, sin frenar nada.
async function vincularAlPagar(tx: Prisma.TransactionClient, inscripcion: InscripcionConTorneo) {
  const { jugador, usuarioId } = inscripcion;
  if (!usuarioId || jugador.usuarioId !== null) return;

  // Una persona, un perfil por organización: si ya tiene otro, no se vincula este.
  const otro = await tx.jugador.findUnique({
    where: { organizacionId_usuarioId: { organizacionId: jugador.organizacionId, usuarioId } },
  });
  if (otro) return;

  const vinculadoPor = inscripcion.vinculaPor ?? Vinculacion.BUSQUEDA;
  const companeros = await tx.jugador.findMany({
    where: { organizacionId: jugador.organizacionId, categoriaId: jugador.categoriaId, ...DEL_PADRON_ACTIVOS },
    select: { id: true, nombre: true, apellido: true },
  });
  // Con el link personal el perfil lo eligió la organización: no hay homónimo que revisar.
  const homonimo = vinculadoPor !== Vinculacion.LINK_PERSONAL && esPosibleHomonimo(jugador, companeros);

  await tx.jugador.update({
    where: { id: jugador.id },
    data: {
      usuarioId,
      vinculadoEn: new Date(),
      vinculadoPor,
      revision: homonimo ? MotivoRevision.HOMONIMO : null,
    },
  });

  // El nombre de la persona sale del primer perfil que vincula (decisión 049).
  if (inscripcion.usuario && !inscripcion.usuario.nombre) {
    await tx.usuario.update({ where: { id: usuarioId }, data: { nombre: jugador.nombre, apellido: jugador.apellido } });
  }
}

export async function rechazarPago(inscripcionId: number, pago: Omit<PagoRecibido, 'medio'>) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.inscripcion.updateMany({
      where: { id: inscripcionId, estado: EstadoInscripcion.PENDIENTE_PAGO },
      data: { estado: EstadoInscripcion.RECHAZADA, resueltaEn: new Date() },
    });
    if (count === 0) return;
    await tx.pago.upsert({
      where: { inscripcionId },
      create: { inscripcionId, estado: EstadoPago.RECHAZADO, monto: pago.monto, mpPaymentId: pago.mpPaymentId, payloadCrudo: pago.payload },
      update: { estado: EstadoPago.RECHAZADO, mpPaymentId: pago.mpPaymentId, payloadCrudo: pago.payload },
    });
    // Un perfil pendiente se descarta, como al vencer la reserva. Si vuelve a intentar, se crea otro.
    const { jugadorId } = await tx.inscripcion.findUniqueOrThrow({ where: { id: inscripcionId }, select: { jugadorId: true } });
    await descartarPerfil(tx, jugadorId);
  });
}

// Lo que avisa MercadoPago: se consulta el pago y se confirma o se rechaza la inscripción.
export async function procesarNotificacion(pagoId: string) {
  const pago = await consultarPago(pagoId);
  const inscripcionId = Number(pago.external_reference);
  if (!Number.isInteger(inscripcionId)) return;

  const datos = { monto: pago.transaction_amount, mpPaymentId: pago.id, payload: pago as Prisma.InputJsonValue };
  if (pago.status === 'approved') await confirmarPago(inscripcionId, { medio: MedioPago.MERCADOPAGO, ...datos });
  if (pago.status === 'rejected' || pago.status === 'cancelled') await rechazarPago(inscripcionId, datos);
}

// Solo sin credenciales de MercadoPago (decisión 053). Con el token cargado, no existe.
export async function simularPago(slug: string, inscripcionId: number, usuarioId: number, datos: DatosPagoSimulado) {
  if (hayMercadoPago()) throw new ErrorHttp(404, 'NO_ENCONTRADO');
  const inscripcion = await inscripcionDe(slug, inscripcionId, usuarioId);
  if (estadoDe(inscripcion) !== 'reservando') throw new ErrorHttp(409, 'RESERVA_NO_VIGENTE');

  const monto = inscripcion.torneo.precio.toNumber();
  if (datos.resultado === 'aprobado') await confirmarPago(inscripcion.id, { medio: MedioPago.MERCADOPAGO, monto });
  else await rechazarPago(inscripcion.id, { monto });
}
