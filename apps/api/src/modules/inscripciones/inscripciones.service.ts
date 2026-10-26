import { EstadoInscripcion, EstadoTorneo, type Prisma } from '@prisma/client';
import type { EstadoTorneo as ClaveEstado, InscripcionesDelTorneo, MedioPago, SolicitudDelTorneo } from '@setpoint/shared';
import { diaEnArgentina } from '../../lib/fechas';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { enviarCorreo } from '../../lib/correo';
import { alcanzanParaLasZonas } from '../competencia/sorteo';
import { alCerrarLaInscripcion } from '../inscripcion/estados';
import { descartarPerfil } from '../inscripcion/perfil-pendiente';
import { solicitudAprobada, solicitudNoAprobada } from './correos';

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';

// Inscripciones de un torneo (F13, versión mínima): ver quiénes ocupan el cupo y cerrar la
// inscripción para que la categoría quede lista para sortear.

// Las que ocupan un lugar del cupo. La lista de espera, las bajas y las vencidas llegan con F13 completa.
const OCUPAN_CUPO = [EstadoInscripcion.PAGADA, EstadoInscripcion.PENDIENTE_PAGO];

const CON_INSCRIPCIONES = {
  categoria: { select: { nombre: true } },
  inscripciones: {
    where: { estado: { in: OCUPAN_CUPO } },
    select: {
      id: true,
      estado: true,
      reservaVence: true,
      creadoEn: true,
      jugador: { select: { nombre: true, apellido: true } },
      pago: { select: { medio: true } },
    },
  },
} satisfies Prisma.TorneoInclude;

type TorneoConInscripciones = Prisma.TorneoGetPayload<{ include: typeof CON_INSCRIPCIONES }>;

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

async function aInscripciones(torneo: TorneoConInscripciones): Promise<InscripcionesDelTorneo> {
  return {
    solicitudes: await solicitudesDe(torneo.id),
    torneoId: torneo.id,
    convocatoriaId: await idDeLaConvocatoria(torneo),
    nombre: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    estado: torneo.estado.toLowerCase() as ClaveEstado,
    modoInscripcion: torneo.modoInscripcion.toLowerCase() as InscripcionesDelTorneo['modoInscripcion'],
    sorteoConfirmado: torneo.sorteoConfirmado,
    cierreInscripcion: torneo.cierreInscripcion?.toISOString().slice(0, 10) ?? null,
    cupo: torneo.cupo,
    cantidadGrupos: torneo.cantidadGrupos,
    alcanzanParaLasZonas: alcanzanParaLasZonas(pagadas(torneo), torneo.cantidadGrupos),
    inscripciones: [...torneo.inscripciones]
      // La más reciente primero; las del mismo momento, por apellido.
      .sort(
        (a, b) =>
          b.creadoEn.getTime() - a.creadoEn.getTime() || a.jugador.apellido.localeCompare(b.jugador.apellido, 'es'),
      )
      .map((i) => ({
        id: i.id,
        nombre: i.jugador.nombre,
        apellido: i.jugador.apellido,
        estado: i.estado === EstadoInscripcion.PAGADA ? 'pagada' : 'reservando',
        medio: (i.pago?.medio.toLowerCase() as MedioPago | undefined) ?? null,
        fecha: diaEnArgentina(i.creadoEn),
        reservaVence: i.estado === EstadoInscripcion.PAGADA ? null : (i.reservaVence?.toISOString() ?? null),
      })),
  };
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
