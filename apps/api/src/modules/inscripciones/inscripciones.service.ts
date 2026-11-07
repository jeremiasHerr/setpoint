import { EstadoInscripcion, EstadoPago, EstadoTorneo, Prisma } from '@prisma/client';
import type {
  BajaDelTorneo,
  EstadoTorneo as ClaveEstado,
  DatosBaja,
  DatosInscripcionManual,
  EnListaDeEspera,
  InscripcionDelTorneo,
  InscripcionesDelTorneo,
  MedioPago,
  SolicitudDelTorneo,
} from '@setpoint/shared';
import { enviarCorreo } from '../../lib/correo';
import { diaEnArgentina } from '../../lib/fechas';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { alcanzanParaLasZonas } from '../competencia/sorteo';
import { alCerrarLaInscripcion } from '../inscripcion/estados';
import { ocupanCupo } from '../inscripcion/inscripcion.service';
import { descartarPerfil } from '../inscripcion/perfil-pendiente';
import { conciliacion, devolucionDe, type PagoCobrado } from './conciliacion';
import { recordatorioDePago, solicitudAprobada, solicitudNoAprobada } from './correos';
import { lugaresLibres, ordenDeLlegada, sePuedeModificar } from './lista-de-espera';
import { avisarLugaresLiberados, promoverListaDeEspera } from './lista-de-espera.service';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';

// Inscripciones de un torneo (F13): quiénes ocupan el cupo, la lista de espera, las bajas y la
// conciliación, y lo que hace la organización con ellas.

// Las que muestra la pantalla. Las vencidas, rechazadas y las solicitudes se leen aparte o no se muestran.
const EN_LA_PANTALLA = [
  EstadoInscripcion.PAGADA,
  EstadoInscripcion.PENDIENTE_PAGO,
  EstadoInscripcion.EN_LISTA_ESPERA,
  EstadoInscripcion.CANCELADA,
];

// Un pago que entró: aprobado, o aprobado y después devuelto por la organización.
const COBRADO: EstadoPago[] = [EstadoPago.APROBADO, EstadoPago.DEVUELTO];

const CON_INSCRIPCIONES = {
  categoria: { select: { nombre: true } },
  inscripciones: {
    where: { estado: { in: EN_LA_PANTALLA } },
    select: {
      id: true,
      jugadorId: true,
      estado: true,
      reservaVence: true,
      ordenListaEspera: true,
      creadoEn: true,
      resueltaEn: true,
      jugador: { select: { nombre: true, apellido: true } },
      pago: { select: { medio: true, estado: true, monto: true, requiereDevolucion: true, devueltoEn: true } },
    },
  },
} satisfies Prisma.TorneoInclude;

type TorneoConInscripciones = Prisma.TorneoGetPayload<{ include: typeof CON_INSCRIPCIONES }>;
type InscripcionLeida = TorneoConInscripciones['inscripciones'][number];

// El :id de la URL es el de un torneo, no el de la convocatoria: cada categoría cierra aparte.
async function torneoDeLaOrganizacion(organizacionId: number, torneoId: number) {
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({ where: { id: torneoId, organizacionId }, include: CON_INSCRIPCIONES });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  return torneo;
}

const pagadas = (torneo: TorneoConInscripciones) =>
  torneo.inscripciones.filter((i) => i.estado === EstadoInscripcion.PAGADA).length;

// Ocupan un lugar las pagadas y las reservas que no vencieron, como al reservar.
const ocupaLugar = (i: InscripcionLeida, ahora: Date) =>
  i.estado === EstadoInscripcion.PAGADA ||
  (i.estado === EstadoInscripcion.PENDIENTE_PAGO && (!i.reservaVence || i.reservaVence > ahora));

const cobrado = (i: InscripcionLeida) => i.pago !== null && COBRADO.includes(i.pago.estado);

const aPagoCobrado = (pago: NonNullable<InscripcionLeida['pago']>): PagoCobrado => ({
  medio: pago.medio,
  monto: pago.monto.toNumber(),
  requiereDevolucion: pago.requiereDevolucion,
  devueltoEn: pago.devueltoEn,
});

const medioDe = (i: InscripcionLeida) => (i.pago?.medio.toLowerCase() as MedioPago | undefined) ?? null;

// La convocatoria se identifica por su primer torneo (decisión 003).
async function idDeLaConvocatoria(torneo: TorneoConInscripciones) {
  if (torneo.edicion === null) return torneo.id;
  const primero = await prisma.torneo.findFirstOrThrow({
    where: { organizacionId: torneo.organizacionId, edicion: torneo.edicion },
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  return primero.id;
}

// Las solicitudes de un torneo con aprobación, de la más vieja a la más nueva: se atienden en orden.
async function solicitudesDe(torneoId: number): Promise<SolicitudDelTorneo[]> {
  const solicitudes = await prisma.inscripcion.findMany({
    where: { torneoId, estado: { in: [EstadoInscripcion.SOLICITADA, EstadoInscripcion.APROBADA] } },
    orderBy: { creadoEn: 'asc' },
    include: { jugador: { select: { nombre: true, apellido: true } }, usuario: { select: { email: true } } },
  });
  return solicitudes.map((i) => ({
    id: i.id,
    nombre: i.jugador.nombre,
    apellido: i.jugador.apellido,
    email: i.usuario?.email ?? '',
    estado: i.estado === EstadoInscripcion.APROBADA ? 'aprobada' : 'solicitada',
    fecha: diaEnArgentina(i.creadoEn),
  }));
}

function aInscripcion(i: InscripcionLeida): InscripcionDelTorneo {
  const pagada = i.estado === EstadoInscripcion.PAGADA;
  return {
    id: i.id,
    jugadorId: i.jugadorId,
    nombre: i.jugador.nombre,
    apellido: i.jugador.apellido,
    estado: pagada ? 'pagada' : 'reservando',
    medio: medioDe(i),
    monto: cobrado(i) ? i.pago!.monto.toNumber() : null,
    fecha: diaEnArgentina(i.creadoEn),
    reservaVence: pagada ? null : (i.reservaVence?.toISOString() ?? null),
    // El número de la lista queda en la inscripción: con él se sabe de dónde vino la reserva.
    deLaListaDeEspera: !pagada && i.ordenListaEspera !== null,
  };
}

const aEnEspera = (i: InscripcionLeida, posicion: number): EnListaDeEspera => ({
  id: i.id,
  jugadorId: i.jugadorId,
  nombre: i.jugador.nombre,
  apellido: i.jugador.apellido,
  posicion,
  fecha: diaEnArgentina(i.creadoEn),
});

const aBaja = (i: InscripcionLeida): BajaDelTorneo => ({
  id: i.id,
  jugadorId: i.jugadorId,
  nombre: i.jugador.nombre,
  apellido: i.jugador.apellido,
  fecha: diaEnArgentina(i.resueltaEn ?? i.creadoEn),
  medio: medioDe(i),
  monto: i.pago?.monto.toNumber() ?? 0,
  devolucion: devolucionDe(i.pago && aPagoCobrado(i.pago)),
});

async function aInscripciones(torneo: TorneoConInscripciones): Promise<InscripcionesDelTorneo> {
  const ahora = new Date();
  const conEstado = (estado: EstadoInscripcion) => torneo.inscripciones.filter((i) => i.estado === estado);
  // Una baja es quien pagó y la organización dio de baja. Las reservas que se cancelaron al resolver
  // un reclamo (decisión 051) no pagaron nada: no son bajas.
  const bajas = conEstado(EstadoInscripcion.CANCELADA).filter(cobrado);

  return {
    solicitudes: await solicitudesDe(torneo.id),
    torneoId: torneo.id,
    convocatoriaId: await idDeLaConvocatoria(torneo),
    nombre: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    categoria: torneo.categoria.nombre,
    estado: torneo.estado.toLowerCase() as ClaveEstado,
    modoInscripcion: torneo.modoInscripcion.toLowerCase() as InscripcionesDelTorneo['modoInscripcion'],
    sorteoConfirmado: torneo.sorteoConfirmado,
    cierreInscripcion: torneo.cierreInscripcion?.toISOString().slice(0, 10) ?? null,
    cupo: torneo.cupo,
    precio: torneo.precio.toNumber(),
    cantidadGrupos: torneo.cantidadGrupos,
    alcanzanParaLasZonas: alcanzanParaLasZonas(pagadas(torneo), torneo.cantidadGrupos),
    libres: lugaresLibres(torneo.cupo, torneo.inscripciones.filter((i) => ocupaLugar(i, ahora)).length),
    sePuedeModificar: sePuedeModificar(torneo),
    tieneListaEspera: torneo.tieneListaEspera,
    horasReservaListaEspera: torneo.horasReservaListaEspera,
    inscripciones: [...conEstado(EstadoInscripcion.PAGADA), ...conEstado(EstadoInscripcion.PENDIENTE_PAGO)]
      // La más reciente primero; las del mismo momento, por apellido.
      .sort(
        (a, b) =>
          b.creadoEn.getTime() - a.creadoEn.getTime() || a.jugador.apellido.localeCompare(b.jugador.apellido, 'es'),
      )
      .map(aInscripcion),
    listaDeEspera: conEstado(EstadoInscripcion.EN_LISTA_ESPERA)
      .sort(ordenDeLlegada)
      .map((i, n) => aEnEspera(i, n + 1)),
    bajas: bajas
      .sort((a, b) => (b.resueltaEn?.getTime() ?? 0) - (a.resueltaEn?.getTime() ?? 0))
      .map(aBaja),
    conciliacion: conciliacion(torneo.inscripciones.filter(cobrado).map((i) => aPagoCobrado(i.pago!))),
  };
}

// Dar de baja e inscribir a mano cambian quién ocupa el cupo: en serie, como al reservar, para que
// dos cambios simultáneos no pasen los dos el chequeo de los lugares.
async function enSerie<T>(trabajo: (tx: Prisma.TransactionClient) => Promise<T>) {
  try {
    return await prisma.$transaction(trabajo, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new ErrorHttp(409, 'CONFLICTO');
    throw error;
  }
}

// Hasta que se confirma el sorteo (decisión 077).
function verificarQueSePuedeModificar(torneo: TorneoConInscripciones) {
  if (sePuedeModificar(torneo)) return;
  throw new ErrorHttp(409, torneo.sorteoConfirmado ? 'SORTEO_CONFIRMADO' : 'INSCRIPCION_NO_ABIERTA');
}

export async function obtenerInscripciones(slug: string, usuarioId: number, torneoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  return aInscripciones(await torneoDeLaOrganizacion(organizacionId, torneoId));
}

// Cierra la inscripción de la categoría: queda lista para sortear. Las reservas sin pagar no se
// tocan: no entran al sorteo, que solo toma las pagadas (decisión 024).
export async function cerrarInscripcion(slug: string, usuarioId: number, torneoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  if (torneo.estado !== EstadoTorneo.PUBLICADO) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');

  // Cerrada, el formato ya no se edita ni la inscripción se reabre: si los que pagaron no
  // alcanzan para las zonas, la categoría quedaría sin poder sortearse (decisión 025).
  if (!alcanzanParaLasZonas(pagadas(torneo), torneo.cantidadGrupos)) {
    throw new ErrorHttp(409, 'INSCRIPTOS_INSUFICIENTES');
  }

  // Con el estado como condición, de dos cierres simultáneos solo uno cambia el torneo.
  const { count } = await prisma.torneo.updateMany({
    where: { id: torneo.id, organizacionId, estado: EstadoTorneo.PUBLICADO },
    data: { estado: EstadoTorneo.INSCRIPCIONES_CERRADAS },
  });
  if (count === 0) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');

  await cerrarSolicitudes(torneo.id);
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// Con la inscripción cerrada, la solicitud que nadie aprobó y la aprobada que no se pagó se
// cierran con ella, y sus perfiles pendientes se descartan (decisión 054). La app lo avisa una vez.
async function cerrarSolicitudes(torneoId: number) {
  const abiertas = await prisma.inscripcion.findMany({
    where: { torneoId, estado: { in: [EstadoInscripcion.SOLICITADA, EstadoInscripcion.APROBADA] } },
    select: { id: true, estado: true, jugadorId: true },
  });
  const ahora = new Date();
  for (const solicitud of abiertas) {
    const final = alCerrarLaInscripcion(solicitud.estado);
    if (!final) continue;
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.inscripcion.updateMany({
        where: { id: solicitud.id, estado: solicitud.estado },
        data: { estado: final, resueltaEn: ahora },
      });
      if (count > 0) await descartarPerfil(tx, solicitud.jugadorId);
    });
  }
}

async function solicitudDelTorneo(organizacionId: number, torneoId: number, inscripcionId: number) {
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  if (!Number.isInteger(inscripcionId)) throw new ErrorHttp(404, 'SOLICITUD_NO_ENCONTRADA');
  const solicitud = await prisma.inscripcion.findFirst({
    where: { id: inscripcionId, torneoId: torneo.id, estado: EstadoInscripcion.SOLICITADA },
    include: { usuario: true },
  });
  if (!solicitud?.usuario) throw new ErrorHttp(404, 'SOLICITUD_NO_ENCONTRADA');
  return { torneo, solicitud: { ...solicitud, usuario: solicitud.usuario } };
}

// Aprobar no reserva el lugar: le llega un email con el link para pagar, y la reserva corre desde
// que lo abre (07 §2.6). El perfil sigue pendiente hasta que pague.
export async function aprobarSolicitud(slug: string, usuarioId: number, torneoId: number, inscripcionId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const { torneo, solicitud } = await solicitudDelTorneo(organizacionId, torneoId, inscripcionId);
  if (torneo.estado !== EstadoTorneo.PUBLICADO) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');

  const { count } = await prisma.inscripcion.updateMany({
    where: { id: solicitud.id, estado: EstadoInscripcion.SOLICITADA },
    data: { estado: EstadoInscripcion.APROBADA, resueltaEn: new Date() },
  });
  if (count === 0) throw new ErrorHttp(409, 'SOLICITUD_NO_ENCONTRADA');

  const organizacion = await prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId } });
  const correo = solicitudAprobada({
    nombre: solicitud.usuario.nombre,
    torneo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    organizacion: organizacion.nombre,
    minutos: torneo.minutosReservaCupo,
    link: `${WEB_URL}/c/${slug}/inscripciones/${solicitud.id}`,
  });
  void enviarCorreo({ para: solicitud.usuario.email, ...correo }).catch((error) => console.error('No se pudo avisar la aprobación', error));
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// Rechazar no pide explicación (02-dominio §2). El perfil pendiente se descarta.
export async function rechazarSolicitud(slug: string, usuarioId: number, torneoId: number, inscripcionId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const { torneo, solicitud } = await solicitudDelTorneo(organizacionId, torneoId, inscripcionId);

  await prisma.$transaction(async (tx) => {
    const { count } = await tx.inscripcion.updateMany({
      where: { id: solicitud.id, estado: EstadoInscripcion.SOLICITADA },
      data: { estado: EstadoInscripcion.NO_APROBADA, resueltaEn: new Date() },
    });
    if (count === 0) throw new ErrorHttp(409, 'SOLICITUD_NO_ENCONTRADA');
    await descartarPerfil(tx, solicitud.jugadorId);
  });

  const organizacion = await prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId } });
  const correo = solicitudNoAprobada({
    nombre: solicitud.usuario.nombre,
    torneo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    organizacion: organizacion.nombre,
  });
  void enviarCorreo({ para: solicitud.usuario.email, ...correo }).catch((error) => console.error('No se pudo avisar el rechazo', error));
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// Dar de baja a quien pagó. La organización dice si le corresponde la devolución y el sistema solo
// lo anota: la plata la devuelve ella, por fuera (decisión 075). Su lugar pasa al primero de la
// lista de espera (decisión 076).
export async function darDeBaja(slug: string, usuarioId: number, torneoId: number, inscripcionId: number, datos: DatosBaja) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  verificarQueSePuedeModificar(torneo);
  const inscripcion = torneo.inscripciones.find((i) => i.id === inscripcionId && i.estado === EstadoInscripcion.PAGADA);
  if (!inscripcion) throw new ErrorHttp(404, 'INSCRIPCION_NO_ENCONTRADA');

  const ahora = new Date();
  const liberados = await enSerie(async (tx) => {
    const { count } = await tx.inscripcion.updateMany({
      where: { id: inscripcion.id, estado: EstadoInscripcion.PAGADA },
      data: { estado: EstadoInscripcion.CANCELADA, resueltaEn: ahora },
    });
    if (count === 0) throw new ErrorHttp(404, 'INSCRIPCION_NO_ENCONTRADA');
    // Con un pago de 0 (un torneo gratis) no hay nada que devolver.
    if (inscripcion.pago) {
      await tx.pago.update({
        where: { inscripcionId: inscripcion.id },
        data: { requiereDevolucion: datos.devolucion && inscripcion.pago.monto.gt(0) },
      });
    }
    // El borrador del sorteo tenía a quien se fue: se descarta y se vuelve a sortear (decisión 014).
    await tx.inscripcion.updateMany({ where: { torneoId: torneo.id }, data: { grupo: null, posicionSiembra: null } });
    return promoverListaDeEspera(tx, torneo.id, ahora);
  });

  await avisarLugaresLiberados(liberados);
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// La organización hizo la devolución, por fuera: deja de estar pendiente en la conciliación.
export async function marcarDevolucion(slug: string, usuarioId: number, torneoId: number, inscripcionId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  if (!Number.isInteger(inscripcionId)) throw new ErrorHttp(404, 'INSCRIPCION_NO_ENCONTRADA');

  const { count } = await prisma.pago.updateMany({
    where: {
      inscripcionId,
      inscripcion: { torneoId: torneo.id, estado: EstadoInscripcion.CANCELADA },
      requiereDevolucion: true,
      devueltoEn: null,
    },
    data: { estado: EstadoPago.DEVUELTO, devueltoEn: new Date() },
  });
  if (count === 0) throw new ErrorHttp(409, 'SIN_DEVOLUCION_PENDIENTE');
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// "Recordarle": le manda otra vez el link para pagar a quien tiene una reserva sin pagar.
export async function recordarPago(slug: string, usuarioId: number, torneoId: number, inscripcionId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  if (!Number.isInteger(inscripcionId)) throw new ErrorHttp(404, 'RESERVA_NO_ENCONTRADA');

  const reserva = await prisma.inscripcion.findFirst({
    where: { id: inscripcionId, torneoId: torneo.id, estado: EstadoInscripcion.PENDIENTE_PAGO, reservaVence: { gt: new Date() } },
    include: {
      usuario: { select: { email: true } },
      jugador: { select: { nombre: true, usuario: { select: { email: true } } } },
    },
  });
  if (!reserva?.reservaVence) throw new ErrorHttp(404, 'RESERVA_NO_ENCONTRADA');
  const email = reserva.usuario?.email ?? reserva.jugador.usuario?.email;
  if (!email) throw new ErrorHttp(409, 'SIN_EMAIL');

  const organizacion = await prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId }, select: { nombre: true } });
  const correo = recordatorioDePago({
    nombre: reserva.jugador.nombre,
    torneo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    organizacion: organizacion.nombre,
    precio: torneo.precio.toNumber(),
    vence: reserva.reservaVence,
    link: `${WEB_URL}/c/${slug}/inscripciones/${reserva.id}`,
  });
  // Lo pidió la organización: si no sale, que se entere.
  await enviarCorreo({ para: email, ...correo });
  return obtenerInscripciones(slug, usuarioId, torneoId);
}

// Inscribir a mano a quien pagó en efectivo o por transferencia (05-pagos §8). Si estaba reservando,
// se confirma su reserva; si no, necesita un lugar libre: la organización no puede pasarse del cupo
// (decisión 079). No vincula ninguna cuenta ni manda comprobante: el pago lo recibió ella.
export async function inscribirAMano(slug: string, usuarioId: number, torneoId: number, datos: DatosInscripcionManual) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  verificarQueSePuedeModificar(torneo);

  const jugador = await prisma.jugador.findFirst({ where: { id: datos.jugadorId, organizacionId, ...DEL_PADRON_ACTIVOS } });
  if (!jugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  if (jugador.categoriaId !== torneo.categoriaId) throw new ErrorHttp(409, 'OTRA_CATEGORIA');

  await enSerie(async (tx) => {
    const ahora = new Date();
    const existente = await tx.inscripcion.findUnique({
      where: { torneoId_jugadorId: { torneoId: torneo.id, jugadorId: jugador.id } },
      include: { pago: true },
    });
    if (existente?.estado === EstadoInscripcion.PAGADA) throw new ErrorHttp(409, 'YA_INSCRIPTO');
    // Una inscripción tiene un solo pago: volver a inscribir a quien se dio de baja pisaría lo que
    // pagó, y la conciliación perdería ese cobro.
    if (existente?.estado === EstadoInscripcion.CANCELADA && existente.pago && COBRADO.includes(existente.pago.estado)) {
      throw new ErrorHttp(409, 'DADO_DE_BAJA');
    }

    const reservando =
      existente?.estado === EstadoInscripcion.PENDIENTE_PAGO && (!existente.reservaVence || existente.reservaVence > ahora);
    if (!reservando) {
      const ocupados = await tx.inscripcion.count({ where: { torneoId: torneo.id, ...ocupanCupo(ahora) } });
      if (lugaresLibres(torneo.cupo, ocupados) === 0) throw new ErrorHttp(409, 'SIN_LUGARES');
    }

    const pagada = { estado: EstadoInscripcion.PAGADA, reservaVence: null, resueltaEn: null };
    const inscripcion = existente
      ? await tx.inscripcion.update({ where: { id: existente.id }, data: pagada })
      : await tx.inscripcion.create({ data: { torneoId: torneo.id, jugadorId: jugador.id, ...pagada } });

    const pago = {
      medio: datos.medio.toUpperCase() as 'EFECTIVO' | 'TRANSFERENCIA' | 'OTRO',
      estado: EstadoPago.APROBADO,
      monto: datos.monto,
    };
    // Un pago anterior, rechazado, se reemplaza: no fue un cobro.
    await tx.pago.upsert({
      where: { inscripcionId: inscripcion.id },
      create: { inscripcionId: inscripcion.id, ...pago },
      update: { ...pago, mpPreferenceId: null, mpPaymentId: null, payloadCrudo: Prisma.DbNull, requiereDevolucion: false, devueltoEn: null },
    });
  });

  return obtenerInscripciones(slug, usuarioId, torneoId);
}
