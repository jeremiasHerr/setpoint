import { Cuadro, type Prisma } from '@prisma/client';
import type { ClaveCuadro, EstadoPartido, PartidoEnVivo, TorneoEnVivo } from '@setpoint/shared';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { partidosDelCalendario, partidosSinFecha } from './en-vivo';
import { zonasConPosiciones } from './posiciones';
import { INCLUIR_ZONAS, inscriptosYPartidos } from './posiciones.service';

// El torneo en vivo (F10): las tablas de las zonas y el calendario, sin login. La tabla sale de
// la misma cuenta que las posiciones de la organización (decisión 019): esta es la ruta pública.

// Sin teléfono ni email: ninguna pantalla pública muestra datos de contacto.
const jugador = { select: { id: true, nombre: true, apellido: true } } as const;

const DEL_PARTIDO = {
  id: true,
  grupo: true,
  cuadro: true,
  ronda: true,
  jugadorAId: true,
  jugadorBId: true,
  ganadorId: true,
  estado: true,
  fechaAcordada: true,
  sedeTexto: true,
  club: { select: { nombre: true } },
  jugadorA: jugador,
  jugadorB: jugador,
  sets: { select: { gamesA: true, gamesB: true, esSuperTieBreak: true }, orderBy: { numero: 'asc' } },
} satisfies Prisma.PartidoSelect;

type PartidoLeido = Prisma.PartidoGetPayload<{ select: typeof DEL_PARTIDO }>;

const aJugador = (j: PartidoLeido['jugadorA']) => j && { jugadorId: j.id, nombre: j.nombre, apellido: j.apellido };

function aPartido(p: PartidoLeido): PartidoEnVivo {
  return {
    id: p.id,
    grupo: p.grupo,
    cuadro: (p.cuadro?.toLowerCase() ?? null) as ClaveCuadro | null,
    ronda: p.ronda,
    jugadorA: aJugador(p.jugadorA),
    jugadorB: aJugador(p.jugadorB),
    ganadorId: p.ganadorId,
    estado: p.estado.toLowerCase() as EstadoPartido,
    fechaAcordada: p.fechaAcordada?.toISOString() ?? null,
    sede: p.club?.nombre ?? p.sedeTexto,
    sets: p.sets,
  };
}

export async function torneoEnVivo(slug: string, torneoId: number): Promise<TorneoEnVivo> {
  const organizacion = await prisma.organizacion.findUnique({ where: { slug }, select: { id: true, nombre: true } });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({
    where: { id: torneoId, organizacionId: organizacion.id },
    include: { categoria: { select: { nombre: true } }, ...INCLUIR_ZONAS },
  });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  // Antes de confirmar, las zonas son un borrador de la organización (decisión 014): no se publican.
  if (!torneo.sorteoConfirmado) throw new ErrorHttp(409, 'ZONAS_NO_GENERADAS');

  // Los enums se ordenan como están declarados: Campeonato antes que el cuadro consuelo.
  const leidos = await prisma.partido.findMany({
    where: { torneoId: torneo.id },
    orderBy: [{ fase: 'asc' }, { grupo: 'asc' }, { cuadro: 'asc' }, { ronda: 'asc' }, { ordenEnRonda: 'asc' }, { id: 'asc' }],
    select: DEL_PARTIDO,
  });
  const partidos = leidos.map((p) => ({ leido: p, enVivo: aPartido(p) }));

  // Las zonas se siguen mostrando con los cuadros armados: dicen cómo llegó cada uno.
  const { inscriptos, partidos: partidosDeZona } = inscriptosYPartidos(torneo);
  const zonas = zonasConPosiciones(inscriptos, partidosDeZona, torneo).map((zona) => ({
    ...zona,
    partidos: partidos.filter(({ leido }) => leido.grupo === zona.grupo && leido.cuadro === null).map(({ enVivo }) => enVivo),
  }));

  const rondas: TorneoEnVivo['rondas'] = {};
  for (const cuadro of [Cuadro.CAMPEONATO, Cuadro.COMPLEMENTARIA]) {
    const delCuadro = leidos.filter((p) => p.cuadro === cuadro);
    if (delCuadro.length > 0) rondas[cuadro.toLowerCase() as ClaveCuadro] = Math.max(...delCuadro.map((p) => p.ronda!));
  }

  return {
    torneoId: torneo.id,
    organizacion: organizacion.nombre,
    nombre: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    clasificanPorGrupo: torneo.clasificanPorGrupo,
    tieneComplementaria: torneo.tieneComplementaria,
    hayCuadros: torneo.gruposCerrados,
    rondas,
    zonas,
    calendario: partidosDelCalendario(leidos).map(aPartido),
    sinFecha: partidosSinFecha(leidos),
  };
}
