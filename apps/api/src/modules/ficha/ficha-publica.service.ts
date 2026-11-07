import { EstadoTorneo, FasePartido, MotivoMovimiento } from '@prisma/client';
import type { FichaDelJugador, RankingDeLaFicha } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { tablaDeCategoria } from '../ranking/ranking';
import { casillerosConInstancia, historialDelJugador } from './ficha';

// La ficha pública del jugador (F17), sin login. Ningún dato de contacto, ni de él ni de sus rivales.

const jugador = { select: { id: true, nombre: true, apellido: true } } as const;

export async function fichaPublica(slug: string, jugadorId: number): Promise<FichaDelJugador> {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    select: { id: true, nombre: true, usaRanking: true },
  });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (!Number.isInteger(jugadorId)) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  const organizacionId = organizacion.id;

  // Como en el ranking público, solo los del padrón que juegan hoy. El filtro por organización es
  // el aislamiento: el id solo no alcanza.
  const elJugador = await prisma.jugador.findFirst({
    where: { id: jugadorId, organizacionId, ...DEL_PADRON_ACTIVOS },
    select: { id: true, nombre: true, apellido: true, categoriaId: true, categoria: { select: { nombre: true, activa: true } } },
  });
  if (!elJugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');

  // Los partidos existen desde que se confirma el sorteo, así que son de torneos ya publicados.
  const partidos = await prisma.partido.findMany({
    where: {
      torneo: { organizacionId, estado: { not: EstadoTorneo.CANCELADO } },
      OR: [{ jugadorAId: jugadorId }, { jugadorBId: jugadorId }],
    },
    select: {
      id: true,
      torneoId: true,
      grupo: true,
      cuadro: true,
      ronda: true,
      jugadorAId: true,
      jugadorBId: true,
      ganadorId: true,
      estado: true,
      fechaAcordada: true,
      jugadorA: jugador,
      jugadorB: jugador,
      sets: { select: { gamesA: true, gamesB: true }, orderBy: { numero: 'asc' } },
    },
  });
  const torneoIds = [...new Set(partidos.map((p) => p.torneoId))];

  const [torneos, partidosDeCuadro, puntos, ranking] = await Promise.all([
    prisma.torneo.findMany({
      where: { id: { in: torneoIds } },
      select: {
        id: true,
        nombre: true,
        edicion: true,
        fechaInicio: true,
        creadoEn: true,
        gruposCerrados: true,
        categoria: { select: { nombre: true } },
      },
    }),
    // Todos los de cuadro de esos torneos, no solo los suyos: para saber cuántas rondas tiene cada cuadro.
    prisma.partido.findMany({
      where: { torneoId: { in: torneoIds }, fase: FasePartido.ELIMINATORIA },
      select: { torneoId: true, cuadro: true, ronda: true },
    }),
    // El cierre guarda uno por jugador y por torneo, y la corrección lo actualiza en su lugar (decisión 055).
    prisma.movimientoRanking.findMany({
      where: { jugadorId, torneoId: { in: torneoIds }, motivo: MotivoMovimiento.RESULTADO_TORNEO },
      select: { torneoId: true, puntos: true },
    }),
    rankingDelJugador(organizacion, elJugador),
  ]);

  const historial = historialDelJugador(
    jugadorId,
    torneos,
    partidos,
    partidosDeCuadro,
    new Map(puntos.map((m) => [m.torneoId!, m.puntos])),
  );

  return {
    organizacion: organizacion.nombre,
    jugadorId: elJugador.id,
    nombre: elJugador.nombre,
    apellido: elJugador.apellido,
    categoria: elJugador.categoria?.nombre ?? null,
    ranking,
    ...historial,
  };
}

type OrganizacionLeida = { id: number; usaRanking: boolean };
type JugadorLeido = { id: number; categoriaId: number | null; categoria: { activa: boolean } | null };

// Su puesto, sus puntos y sus casilleros en la categoría en la que juega hoy. Salen de la misma tabla
// que el ranking público (F09), para que las dos pantallas digan lo mismo.
async function rankingDelJugador(organizacion: OrganizacionLeida, elJugador: JugadorLeido): Promise<RankingDeLaFicha | null> {
  if (!organizacion.usaRanking || elJugador.categoriaId === null || !elJugador.categoria?.activa) return null;
  const organizacionId = organizacion.id;
  const categoriaId = elJugador.categoriaId;

  const [etapas, jugadores, movimientos] = await Promise.all([
    prisma.etapa.findMany({ where: { organizacionId, activa: true }, orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
    prisma.jugador.findMany({
      where: { organizacionId, categoriaId, ...DEL_PADRON_ACTIVOS },
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.movimientoRanking.findMany({
      where: { organizacionId, categoriaId },
      select: { id: true, jugadorId: true, etapaId: true, puntos: true, fecha: true, instancia: true },
    }),
  ]);

  const ids = new Set(jugadores.map((j) => j.id));
  const fila = tablaDeCategoria(jugadores, movimientos.filter((m) => ids.has(m.jugadorId))).find((f) => f.jugadorId === elJugador.id);
  if (!fila) return null;

  return {
    puesto: fila.puesto,
    puntos: fila.puntos,
    torneosDelCalendario: etapas,
    casilleros: casillerosConInstancia(
      fila.casilleros,
      movimientos.filter((m) => m.jugadorId === elJugador.id),
    ),
  };
}
