import { EstadoPartido as EstadoPrisma, EstadoTorneo, type Prisma } from '@prisma/client';
import type { AccionDeFecha, CoordinacionDelPartido, DatosFechaAcordada } from '@setpoint/shared';
import { hoy } from '../../lib/fechas';
import { organizacionAdministrada, perfilDeJugador } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { avisoDeFechaAnotada, avisoDeFechaConfirmada, avisosDeFechaDeLaOrganizacion, type Aviso } from '../avisos/avisos';
import { enviarAvisos } from '../avisos/avisos.service';
import { instancia, rondasDeLosCuadros } from '../jugador/mis-partidos';
import {
  accionDeFecha,
  accionDeLaOrganizacion,
  cambioDeFecha,
  diaYHoraEnArgentina,
  diasDisponibles,
  fechaCorta,
  instanteEnArgentina,
  problemaAlConfirmar,
  problemaDeFecha,
  quienAnoto,
  sedeElegida,
  ultimoDiaDelPlazo,
} from './coordinacion';

// Coordinación de partidos (F14). Los jugadores anotan la fecha que acordaron por WhatsApp y el
// rival la confirma (04-flujo-jugador §6). La organización la puede cargar en nombre de los dos,
// y entonces queda confirmada (decisión 064). Cada cambio queda en el historial (decisión 066).

// Se coordina desde que se confirma el sorteo, aunque el torneo todavía no haya empezado: los
// partidos que se adelantan (03-flujo-organizacion §3).
const EN_JUEGO: EstadoTorneo[] = [EstadoTorneo.ZONAS_GENERADAS, EstadoTorneo.GRUPOS_EN_CURSO, EstadoTorneo.ELIMINATORIAS];

const JUGADOR = { select: { nombre: true, apellido: true, usuarioId: true } } as const;

const DEL_PARTIDO = {
  id: true,
  torneoId: true,
  fase: true,
  grupo: true,
  cuadro: true,
  ronda: true,
  estado: true,
  jugadorAId: true,
  jugadorBId: true,
  fechaLimite: true,
  fechaAcordada: true,
  clubId: true,
  sedeTexto: true,
  anotadaPorId: true,
  reprogramaciones: true,
  club: { select: { nombre: true } },
  jugadorA: JUGADOR,
  jugadorB: JUGADOR,
  torneo: {
    select: {
      organizacionId: true,
      estado: true,
      sedeGrupos: true,
      sedeEliminatorias: true,
      clubSedeId: true,
      clubSede: { select: { nombre: true } },
      reprogramacionesPermitidas: true,
      horasAntelacionReprogramar: true,
      organizacion: { select: { clubes: { select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } } } },
    },
  },
} satisfies Prisma.PartidoSelect;

type Partido = Prisma.PartidoGetPayload<{ select: typeof DEL_PARTIDO }>;

// Quién pregunta: un jugador del partido o la organización.
type Vista = { jugadorId: number; usuarioId: number } | { organizacion: true };

const nombre = (j: Partido['jugadorA']) => j && { nombre: j.nombre, apellido: j.apellido };

const modoDeSede = (p: Partido) => (p.fase === 'GRUPOS' ? p.torneo.sedeGrupos : p.torneo.sedeEliminatorias);

// El partido de un jugador: solo los suyos, en un torneo de su organización.
async function partidoDelJugador(slug: string, usuarioId: number, partidoId: number) {
  const { organizacionId, jugadorId } = await perfilDeJugador(slug, usuarioId);
  if (!Number.isInteger(partidoId)) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const partido = await prisma.partido.findFirst({
    where: { id: partidoId, torneo: { organizacionId }, OR: [{ jugadorAId: jugadorId }, { jugadorBId: jugadorId }] },
    select: DEL_PARTIDO,
  });
  if (!partido) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  return { partido, vista: { jugadorId, usuarioId } };
}

// Partido no tiene organizacionId: se busca dentro del torneo, filtrado por la organización.
async function partidoDeLaOrganizacion(slug: string, usuarioId: number, torneoId: number, partidoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!Number.isInteger(torneoId) || !Number.isInteger(partidoId)) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const partido = await prisma.partido.findFirst({
    where: { id: partidoId, torneoId, torneo: { organizacionId } },
    select: DEL_PARTIDO,
  });
  if (!partido) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  return partido;
}

async function nombreDeLaInstancia(partido: Partido) {
  if (partido.cuadro === null) return instancia(partido, new Map());
  const rondas = await prisma.partido.findMany({
    where: { torneoId: partido.torneoId, cuadro: partido.cuadro },
    select: { cuadro: true, ronda: true },
  });
  return instancia(partido, rondasDeLosCuadros(rondas));
}

function reglas(partido: Partido) {
  return {
    reprogramacionesPermitidas: partido.torneo.reprogramacionesPermitidas,
    horasAntelacionReprogramar: partido.torneo.horasAntelacionReprogramar,
  };
}

// Qué puede hacer quien pregunta. La organización no tiene los límites de los jugadores.
function queSePuede(partido: Partido, vista: Vista, ahora: Date) {
  if (!EN_JUEGO.includes(partido.torneo.estado)) return { bloqueo: 'PARTIDO_TERMINADO' as const };
  if ('organizacion' in vista) return accionDeLaOrganizacion(partido, ahora);
  return accionDeFecha(partido, reglas(partido), ahora);
}

const anotadaPorLaOrganizacion = (p: Partido) =>
  p.anotadaPorId !== null && p.anotadaPorId !== p.jugadorA?.usuarioId && p.anotadaPorId !== p.jugadorB?.usuarioId;

async function aCoordinacion(partido: Partido, vista: Vista, ahora = new Date()): Promise<CoordinacionDelPartido> {
  const esA = 'jugadorId' in vista && partido.jugadorAId === vista.jugadorId;
  const rival = 'jugadorId' in vista ? (esA ? partido.jugadorB : partido.jugadorA) : null;
  const ultimoDia = ultimoDiaDelPlazo(partido.fechaLimite);
  const sePuede = queSePuede(partido, vista, ahora);
  const restantes = Math.max(0, partido.torneo.reprogramacionesPermitidas - partido.reprogramaciones);

  return {
    partidoId: partido.id,
    instancia: await nombreDeLaInstancia(partido),
    jugadores: [nombre(partido.jugadorA), nombre(partido.jugadorB)],
    rival: nombre(rival),
    estado: partido.estado,
    ultimoDia,
    dias: ultimoDia !== null && ultimoDia < hoy() ? [] : diasDisponibles(hoy(), ultimoDia),
    sede:
      modoDeSede(partido) === 'DESIGNADA'
        ? { modo: 'designada', nombre: partido.torneo.clubSede?.nombre ?? null }
        : { modo: 'libre', clubes: partido.torneo.organizacion.clubes },
    actual: partido.fechaAcordada && {
      ...diaYHoraEnArgentina(partido.fechaAcordada),
      clubId: partido.clubId,
      sedeTexto: partido.sedeTexto,
      sede: partido.club?.nombre ?? partido.sedeTexto,
    },
    // Para la organización solo importa si la cargó ella: lo de cada jugador se ve en el historial.
    anotadaPor:
      'organizacion' in vista
        ? anotadaPorLaOrganizacion(partido)
          ? 'organizacion'
          : null
        : quienAnoto(partido.anotadaPorId, vista.usuarioId, rival?.usuarioId ?? null),
    accion: 'accion' in sePuede ? sePuede.accion : null,
    bloqueo: 'bloqueo' in sePuede ? sePuede.bloqueo : null,
    reprogramacionesRestantes: restantes,
    horasAntelacionReprogramar: partido.torneo.horasAntelacionReprogramar,
  };
}

const MENSAJE_DE_FECHA = {
  FECHA_PASADA: { hora: 'Esa hora ya pasó' },
  FUERA_DEL_PLAZO: { dia: 'Ese día ya no entra en el plazo' },
};

const MENSAJE_DE_SEDE = {
  FALTA_SEDE: { clubId: 'Elegí dónde juegan' },
  CLUB_NO_ENCONTRADO: { clubId: 'Ese club no está en el circuito' },
};

// Guarda la fecha y deja el evento en el historial, en una transacción. La condición sobre cómo
// estaba el partido evita pisar lo que el rival anotó o confirmó mientras tanto.
async function guardarFecha(partido: Partido, datos: DatosFechaAcordada, usuarioId: number, accion: AccionDeFecha, porOrganizacion: boolean) {
  const ahora = new Date();
  const instante = instanteEnArgentina(datos.dia, datos.hora);
  const problema = problemaDeFecha(instante, ultimoDiaDelPlazo(partido.fechaLimite), ahora);
  if (problema) throw new ErrorHttp(400, problema, MENSAJE_DE_FECHA[problema]);

  const sede = sedeElegida(
    modoDeSede(partido),
    partido.torneo.clubSedeId,
    partido.torneo.organizacion.clubes.map((c) => c.id),
    datos,
  );
  if (typeof sede === 'string') throw new ErrorHttp(400, sede, MENSAJE_DE_SEDE[sede]);

  const cambio = cambioDeFecha(accion, partido.reprogramaciones, porOrganizacion);
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.partido.updateMany({
      where: {
        id: partido.id,
        estado: partido.estado,
        reprogramaciones: partido.reprogramaciones,
        fechaAcordada: partido.fechaAcordada,
      },
      data: {
        estado: cambio.estado,
        fechaAcordada: instante,
        ...sede,
        anotadaPorId: usuarioId,
        confirmadaPorId: porOrganizacion ? usuarioId : null,
        reprogramaciones: cambio.reprogramaciones,
      },
    });
    if (count === 0) throw new ErrorHttp(409, 'PARTIDO_CAMBIO');
    await tx.eventoCoordinacion.create({
      data: { partidoId: partido.id, tipo: cambio.evento, usuarioId, porOrganizacion, fechaAcordada: instante, ...sede },
    });
  });
  return instante;
}

// Sin esperarlo: un aviso que no sale no deshace lo que se guardó (decisión 047).
function avisar(avisos: Aviso[]) {
  void enviarAvisos(avisos).catch((error) => console.error('No se pudo avisar la fecha', error));
}

// --- jugador ---

export async function coordinacionDelJugador(slug: string, usuarioId: number, partidoId: number) {
  const { partido, vista } = await partidoDelJugador(slug, usuarioId, partidoId);
  return aCoordinacion(partido, vista);
}

// Anota, cambia o reprograma la fecha. Queda esperando que el rival la confirme.
export async function anotarFecha(slug: string, usuarioId: number, partidoId: number, datos: DatosFechaAcordada) {
  const { partido, vista } = await partidoDelJugador(slug, usuarioId, partidoId);
  const sePuede = queSePuede(partido, vista, new Date());
  if ('bloqueo' in sePuede) throw new ErrorHttp(409, sePuede.bloqueo);

  const instante = await guardarFecha(partido, datos, usuarioId, sePuede.accion, false);

  const esA = partido.jugadorAId === vista.jugadorId;
  const [yo, rival] = esA ? [partido.jugadorA!, partido.jugadorB!] : [partido.jugadorB!, partido.jugadorA!];
  avisar(avisoDeFechaAnotada(yo, rival, fechaCorta(instante), sePuede.accion !== 'anotar'));

  return coordinacionDelJugador(slug, usuarioId, partidoId);
}

// El rival confirma con un toque que está al tanto (04-flujo-jugador §6.3).
export async function confirmarFecha(slug: string, usuarioId: number, partidoId: number) {
  const { partido, vista } = await partidoDelJugador(slug, usuarioId, partidoId);
  // Vencido o terminado, ya no hay nada que agendar: lo resuelve la organización.
  const sePuede = queSePuede(partido, vista, new Date());
  if ('bloqueo' in sePuede && sePuede.bloqueo !== 'SIN_REPROGRAMACIONES' && sePuede.bloqueo !== 'SIN_ANTELACION') {
    throw new ErrorHttp(409, sePuede.bloqueo);
  }
  const problema = problemaAlConfirmar(partido, usuarioId);
  if (problema) throw new ErrorHttp(409, problema);

  await prisma.$transaction(async (tx) => {
    const { count } = await tx.partido.updateMany({
      where: { id: partido.id, estado: EstadoPrisma.ANOTADA, anotadaPorId: partido.anotadaPorId, fechaAcordada: partido.fechaAcordada },
      data: { estado: EstadoPrisma.CONFIRMADA, confirmadaPorId: usuarioId },
    });
    if (count === 0) throw new ErrorHttp(409, 'PARTIDO_CAMBIO');
    await tx.eventoCoordinacion.create({
      data: {
        partidoId: partido.id,
        tipo: 'CONFIRMADA',
        usuarioId,
        fechaAcordada: partido.fechaAcordada,
        clubId: partido.clubId,
        sedeTexto: partido.sedeTexto,
      },
    });
  });

  const esA = partido.jugadorAId === vista.jugadorId;
  const [yo, rival] = esA ? [partido.jugadorA!, partido.jugadorB!] : [partido.jugadorB!, partido.jugadorA!];
  // Si la anotó el rival, el aviso es para él.
  if (partido.fechaAcordada && rival.usuarioId === partido.anotadaPorId) {
    avisar(avisoDeFechaConfirmada(yo, rival, fechaCorta(partido.fechaAcordada)));
  }

  return coordinacionDelJugador(slug, usuarioId, partidoId);
}

// --- organización ---

export async function coordinacionDeLaOrganizacion(slug: string, usuarioId: number, torneoId: number, partidoId: number) {
  const partido = await partidoDeLaOrganizacion(slug, usuarioId, torneoId, partidoId);
  return aCoordinacion(partido, { organizacion: true });
}

// La organización carga la fecha en nombre de los jugadores: ninguno queda bloqueado por no tener
// cuenta (F14). Queda confirmada y no gasta reprogramaciones (decisión 064). Lo carga desde el
// tablero (decisión 062).
export async function anotarFechaPorLaOrganizacion(
  slug: string,
  usuarioId: number,
  torneoId: number,
  partidoId: number,
  datos: DatosFechaAcordada,
) {
  const partido = await partidoDeLaOrganizacion(slug, usuarioId, torneoId, partidoId);
  const sePuede = queSePuede(partido, { organizacion: true }, new Date());
  if ('bloqueo' in sePuede) throw new ErrorHttp(409, sePuede.bloqueo);

  const instante = await guardarFecha(partido, datos, usuarioId, sePuede.accion, true);
  avisar(avisosDeFechaDeLaOrganizacion(partido.jugadorA!, partido.jugadorB!, fechaCorta(instante)));

  return coordinacionDeLaOrganizacion(slug, usuarioId, torneoId, partidoId);
}
