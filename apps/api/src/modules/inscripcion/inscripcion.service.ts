import { EstadoInscripcion, EstadoJugador, EstadoTorneo, ModoInscripcion, Prisma, Vinculacion } from '@prisma/client';
import type {
  BusquedaEnElPadron,
  DatosInscribirComoNuevo,
  DatosReservar,
  InscripcionComoNuevo,
  PerfilEncontrado,
  Reserva,
  SituacionEnElTorneo,
} from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { buscar } from './busqueda';
import { crearPerfilPendiente } from './perfil-pendiente';

// La inscripción del jugador a un torneo (F12): encontrar su perfil y reservar el lugar
// (04-flujo-jugador §5.6, decisión 051). El pago llega después, con MercadoPago.

// Una reserva sin pagar ocupa el lugar mientras no vence. Las viejas sin vencimiento también,
// como en la pantalla Inscripciones de la organización.
function reservaVigente(ahora: Date): Prisma.InscripcionWhereInput {
  return { estado: EstadoInscripcion.PENDIENTE_PAGO, OR: [{ reservaVence: null }, { reservaVence: { gt: ahora } }] };
}

export function ocupanCupo(ahora: Date): Prisma.InscripcionWhereInput {
  return { OR: [{ estado: EstadoInscripcion.PAGADA }, reservaVigente(ahora)] };
}

// El torneo por el slug de su organización: el id solo no alcanza para el aislamiento.
async function torneoPublicado(slug: string, torneoId: number) {
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  const torneo = await prisma.torneo.findFirst({ where: { id: torneoId, organizacion: { slug } } });
  if (!torneo || torneo.estado === EstadoTorneo.BORRADOR || torneo.estado === EstadoTorneo.CANCELADO) {
    throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  }
  return torneo;
}

// Los perfiles de la categoría que se pueden buscar. Los reservados por otra inscripción en curso
// no aparecen: así dos personas no eligen el mismo a la vez (decisión 051).
async function padronDeLaCategoria(organizacionId: number, categoriaId: number) {
  const ahora = new Date();
  return prisma.jugador.findMany({
    where: {
      organizacionId,
      categoriaId,
      ...DEL_PADRON_ACTIVOS,
      NOT: { usuarioId: null, inscripciones: { some: reservaVigente(ahora) } },
    },
    select: { id: true, nombre: true, apellido: true, usuarioId: true },
  });
}

function aEncontrado(j: { id: number; nombre: string; apellido: string; usuarioId: number | null }): PerfilEncontrado {
  return { jugadorId: j.id, nombre: j.nombre, apellido: j.apellido, vinculado: j.usuarioId !== null };
}

// Sin login: la usa la pantalla antes de saber quién es. Solo nombre y apellido, de la categoría
// del torneo, y nada hasta 3 letras.
export async function buscarEnElPadron(slug: string, torneoId: number, consulta: string): Promise<BusquedaEnElPadron> {
  const torneo = await torneoPublicado(slug, torneoId);
  const padron = await padronDeLaCategoria(torneo.organizacionId, torneo.categoriaId);
  return { perfiles: buscar(padron, consulta).map(aEncontrado) };
}

const ESTADO_EN_LA_SITUACION: Partial<Record<EstadoInscripcion, 'pagada' | 'solicitada' | 'aprobada'>> = {
  PAGADA: 'pagada',
  SOLICITADA: 'solicitada',
  APROBADA: 'aprobada',
};

export async function situacionEnElTorneo(slug: string, torneoId: number, usuarioId: number): Promise<SituacionEnElTorneo> {
  const torneo = await torneoPublicado(slug, torneoId);
  const ahora = new Date();

  const [usuario, perfil, inscripcion] = await Promise.all([
    prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } }),
    prisma.jugador.findUnique({
      where: { organizacionId_usuarioId: { organizacionId: torneo.organizacionId, usuarioId } },
      include: { categoria: { select: { nombre: true } } },
    }),
    // La suya, por el perfil ya vinculado o por la reserva que hizo antes de vincularlo.
    // También la solicitud de un torneo con aprobación, o la aprobada que falta pagar (decisión 054).
    prisma.inscripcion.findFirst({
      where: {
        torneoId,
        AND: [
          { OR: [ocupanCupo(ahora), { estado: { in: [EstadoInscripcion.SOLICITADA, EstadoInscripcion.APROBADA] } }] },
          { OR: [{ usuarioId }, { jugador: { usuarioId } }] },
        ],
      },
      orderBy: { creadoEn: 'desc' },
    }),
  ]);

  // El "¿Sos…?" es para quien ya juega en otro circuito: su cuenta tiene apellido. Los perfiles
  // vinculados a otra cuenta no se proponen.
  const propuestas =
    !perfil && usuario.apellido
      ? buscar(await padronDeLaCategoria(torneo.organizacionId, torneo.categoriaId), usuario.apellido)
          .filter((j) => j.usuarioId === null)
          .map(aEncontrado)
      : [];

  return {
    // Un perfil pendiente todavía no es su perfil en el circuito: es una inscripción en curso.
    perfil:
      perfil?.estado === EstadoJugador.PADRON
        ? { jugadorId: perfil.id, nombre: perfil.nombre, apellido: perfil.apellido, categoria: perfil.categoria?.nombre ?? null }
        : null,
    inscripcion: inscripcion && {
      id: inscripcion.id,
      estado: ESTADO_EN_LA_SITUACION[inscripcion.estado] ?? 'reservando',
      reservaVence: inscripcion.reservaVence?.toISOString() ?? null,
    },
    propuestas,
  };
}

const VINCULA_POR = {
  busqueda: Vinculacion.BUSQUEDA,
  propuesta: Vinculacion.PROPUESTA,
  link_personal: Vinculacion.LINK_PERSONAL,
} as const;

// Reserva el lugar en el torneo por los minutos que configura (por defecto, 15). Si el perfil no
// era suyo, queda reservado para esta persona y se vincula recién al confirmarse el pago.
export async function reservar(slug: string, torneoId: number, usuarioId: number, datos: DatosReservar): Promise<Reserva> {
  const torneo = await torneoPublicado(slug, torneoId);
  if (torneo.estado !== EstadoTorneo.PUBLICADO) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');

  try {
    return await prisma.$transaction(
      async (tx) => {
        const ahora = new Date();

        const propio = await tx.jugador.findUnique({
          where: { organizacionId_usuarioId: { organizacionId: torneo.organizacionId, usuarioId } },
        });
        // Con un perfil pendiente tiene una inscripción en curso en el circuito: primero se resuelve
        // esa (decisión 054).
        if (propio && propio.estado !== EstadoJugador.PADRON) throw new ErrorHttp(409, 'INSCRIPCION_EN_CURSO');
        // Una persona tiene un solo perfil por organización (decisión 051).
        if (propio && propio.id !== datos.jugadorId) throw new ErrorHttp(409, 'YA_TENES_PERFIL');
        // Tampoco puede reservar dos perfiles distintos mientras todavía no tiene ninguno: al pagar,
        // solo uno se podría vincular.
        if (!propio) {
          const otraReserva = await tx.inscripcion.findFirst({
            where: {
              usuarioId,
              jugadorId: { not: datos.jugadorId },
              jugador: { organizacionId: torneo.organizacionId, usuarioId: null },
              ...reservaVigente(ahora),
            },
          });
          if (otraReserva) throw new ErrorHttp(409, 'OTRO_PERFIL_RESERVADO');
        }

        const jugador = await tx.jugador.findFirst({
          where: { id: datos.jugadorId, organizacionId: torneo.organizacionId, activo: true },
        });
        if (!jugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
        if (jugador.usuarioId !== null && jugador.usuarioId !== usuarioId) throw new ErrorHttp(409, 'PERFIL_VINCULADO');
        if (jugador.categoriaId !== torneo.categoriaId) throw new ErrorHttp(409, 'OTRA_CATEGORIA');
        // Con el link personal no hay revisión de homónimo: el código tiene que ser el del perfil, y
        // uno regenerado ya no sirve (decisión 050).
        if (datos.vinculaPor === 'link_personal' && (!jugador.codigoLink || jugador.codigoLink !== datos.codigoLink)) {
          throw new ErrorHttp(404, 'LINK_NO_ENCONTRADO');
        }

        const existente = await tx.inscripcion.findUnique({
          where: { torneoId_jugadorId: { torneoId, jugadorId: jugador.id } },
        });
        if (existente?.estado === EstadoInscripcion.PAGADA) throw new ErrorHttp(409, 'YA_INSCRIPTO');
        const vigente =
          existente?.estado === EstadoInscripcion.PENDIENTE_PAGO && (!existente.reservaVence || existente.reservaVence > ahora);
        if (vigente) {
          // Vuelve a la reserva que ya tenía: sigue con el pago donde lo dejó.
          if (existente.usuarioId === usuarioId) {
            return { inscripcionId: existente.id, reservaVence: (existente.reservaVence ?? ahora).toISOString() };
          }
          throw new ErrorHttp(409, 'PERFIL_RESERVADO');
        }

        const ocupados = await tx.inscripcion.count({ where: { torneoId, ...ocupanCupo(ahora) } });
        if (ocupados >= torneo.cupo) throw new ErrorHttp(409, 'SIN_LUGARES');

        const reservaVence = new Date(ahora.getTime() + torneo.minutosReservaCupo * 60_000);
        const datosReserva = {
          estado: EstadoInscripcion.PENDIENTE_PAGO,
          reservaVence,
          usuarioId,
          // Si el perfil ya era suyo, no hay nada que vincular.
          vinculaPor: propio ? null : VINCULA_POR[datos.vinculaPor ?? 'busqueda'],
        };

        // Una reserva vencida o un pago rechazado dejan la fila: se reusa, porque hay una sola
        // inscripción por perfil y torneo.
        const inscripcion = existente
          ? await tx.inscripcion.update({ where: { id: existente.id }, data: datosReserva })
          : await tx.inscripcion.create({ data: { torneoId, jugadorId: jugador.id, ...datosReserva } });

        return { inscripcionId: inscripcion.id, reservaVence: reservaVence.toISOString() };
      },
      // Para que dos reservas simultáneas no pasen las dos el chequeo del cupo.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      throw new ErrorHttp(409, 'CONFLICTO');
    }
    throw error;
  }
}

// Quien no está en el padrón, en un torneo con aprobación o abierto (decisión 054). El perfil se crea
// pendiente, en la categoría del torneo: con aprobación queda como solicitud, sin ocupar lugar;
// abierto, reserva el lugar como cualquier otro. Entra al padrón recién al pagar.
export async function inscribirComoNuevo(
  slug: string,
  torneoId: number,
  usuarioId: number,
  datos: DatosInscribirComoNuevo,
): Promise<InscripcionComoNuevo> {
  const torneo = await torneoPublicado(slug, torneoId);
  if (torneo.estado !== EstadoTorneo.PUBLICADO) throw new ErrorHttp(409, 'INSCRIPCION_NO_ABIERTA');
  if (torneo.modoInscripcion === ModoInscripcion.CERRADA) throw new ErrorHttp(409, 'SOLO_PADRON');
  const conAprobacion = torneo.modoInscripcion === ModoInscripcion.CON_APROBACION;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const ahora = new Date();

        const propio = await tx.jugador.findUnique({
          where: { organizacionId_usuarioId: { organizacionId: torneo.organizacionId, usuarioId } },
        });
        if (propio) throw new ErrorHttp(409, propio.estado === EstadoJugador.PADRON ? 'YA_TENES_PERFIL' : 'INSCRIPCION_EN_CURSO');
        // Tampoco si está pagando con un perfil del padrón que eligió en la búsqueda.
        const otraReserva = await tx.inscripcion.findFirst({
          where: { usuarioId, jugador: { organizacionId: torneo.organizacionId }, ...reservaVigente(ahora) },
        });
        if (otraReserva) throw new ErrorHttp(409, 'OTRO_PERFIL_RESERVADO');

        if (!conAprobacion) {
          const ocupados = await tx.inscripcion.count({ where: { torneoId, ...ocupanCupo(ahora) } });
          if (ocupados >= torneo.cupo) throw new ErrorHttp(409, 'SIN_LUGARES');
        }

        const jugador = await crearPerfilPendiente(tx, {
          organizacionId: torneo.organizacionId,
          categoriaId: torneo.categoriaId,
          usuarioId,
          nombre: datos.nombre,
          apellido: datos.apellido,
        });
        const reservaVence = conAprobacion ? null : new Date(ahora.getTime() + torneo.minutosReservaCupo * 60_000);
        const inscripcion = await tx.inscripcion.create({
          data: {
            torneoId,
            jugadorId: jugador.id,
            usuarioId,
            estado: conAprobacion ? EstadoInscripcion.SOLICITADA : EstadoInscripcion.PENDIENTE_PAGO,
            reservaVence,
          },
        });
        // Si la persona todavía no tenía nombre, es el que acaba de escribir (decisión 049).
        await tx.usuario.updateMany({ where: { id: usuarioId, nombre: '' }, data: { nombre: datos.nombre, apellido: datos.apellido } });

        return {
          inscripcionId: inscripcion.id,
          estado: conAprobacion ? 'solicitada' : 'reservando',
          reservaVence: reservaVence?.toISOString() ?? null,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new ErrorHttp(409, 'CONFLICTO');
    // Dos pedidos a la vez de la misma persona: el segundo choca con el perfil del primero.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ErrorHttp(409, 'INSCRIPCION_EN_CURSO');
    throw error;
  }
}
