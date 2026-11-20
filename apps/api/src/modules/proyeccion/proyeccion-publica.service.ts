import { EstadoInscripcion, EstadoTorneo, FasePartido } from '@prisma/client';
import type { ProyeccionDelJugador } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import type { TablaDePuntos } from '../competencia/cierre';
import { instanciaEnElTorneo } from '../ficha/ficha';
import { rondasDeLosCuadros } from '../jugador/mis-partidos';
import { NO_PUBLICOS } from '../torneos/torneo-publico';
import { instanciasAlcanzables, proyectar, rondasPorElFormato } from './proyeccion';

// La proyección de un jugador en un torneo (F20), sin login. Todo lo que usa ya es público: el
// ranking (F09) y los cuadros (F10). No llama a ningún modelo: es una cuenta exacta (decisión 117).

const jugador = { select: { id: true, nombre: true, apellido: true } } as const;

export async function proyeccionPublica(slug: string, torneoId: number, jugadorId: number): Promise<ProyeccionDelJugador> {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    select: { id: true, usaRanking: true, puntajes: { select: { instancia: true, puntos: true } } },
  });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  if (!Number.isInteger(jugadorId)) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  const organizacionId = organizacion.id;

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({
    where: { id: torneoId, organizacionId, estado: { notIn: NO_PUBLICOS } },
    select: {
      id: true,
      nombre: true,
      edicion: true,
      estado: true,
      categoriaId: true,
      sorteoConfirmado: true,
      gruposCerrados: true,
      cantidadGrupos: true,
      clasificanPorGrupo: true,
      categoria: { select: { nombre: true } },
      etapa: { select: { id: true, nombre: true } },
      inscripciones: {
        where: { OR: [{ grupo: { not: null } }, { estado: EstadoInscripcion.PAGADA }] },
        select: { grupo: true, estado: true, jugador },
      },
      partidos: {
        where: { fase: FasePartido.ELIMINATORIA },
        select: { cuadro: true, ronda: true, jugadorAId: true, jugadorBId: true, ganadorId: true, estado: true },
      },
    },
  });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  // Como en el cierre: da puntos si la organización lleva ranking y es de un torneo del calendario.
  if (!organizacion.usaRanking || !torneo.etapa) throw new ErrorHttp(409, 'TORNEO_SIN_RANKING');
  // Cerrado ya no hay nada que proyectar: los puntos están en el ranking.
  if (torneo.estado === EstadoTorneo.FINALIZADO) throw new ErrorHttp(409, 'TORNEO_CERRADO');

  // Quiénes lo juegan: con el sorteo confirmado, los que tienen zona, como en el cierre. Antes, los
  // que pagaron: la zona de un sorteo sin confirmar es un borrador (decisión 014).
  const participantes = torneo.inscripciones
    .filter((i) => (torneo.sorteoConfirmado ? i.grupo !== null : i.estado === EstadoInscripcion.PAGADA))
    .map((i) => ({ ...i.jugador, grupo: i.grupo }));
  const elJugador = participantes.find((j) => j.id === jugadorId);
  // No está en el padrón de esta organización, o no juega este torneo.
  if (!elJugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');

  const rondasPorCuadro = rondasDeLosCuadros(torneo.partidos);
  const rondas = torneo.gruposCerrados
    ? (rondasPorCuadro.get('CAMPEONATO') ?? 0)
    : rondasPorElFormato(tamanosDeLasZonas(torneo, participantes), torneo.clasificanPorGrupo);

  const situacionDe = (id: number) =>
    torneo.sorteoConfirmado
      ? instanciaEnElTorneo(
          id,
          torneo.partidos.filter((p) => p.jugadorAId === id || p.jugadorBId === id),
          rondasPorCuadro,
          torneo.gruposCerrados,
        )
      : null;

  // Como en el ranking público, cuentan los jugadores que hoy están en la categoría.
  const [deLaCategoria, movimientos] = await Promise.all([
    prisma.jugador.findMany({
      where: { organizacionId, ...DEL_PADRON_ACTIVOS, categoriaId: torneo.categoriaId },
      select: jugador.select,
    }),
    prisma.movimientoRanking.findMany({
      // Sin los de este torneo. Los importados no tienen torneo: un NOT solo los dejaría afuera, porque
      // en SQL NULL no es distinto de nada.
      where: { organizacionId, categoriaId: torneo.categoriaId, OR: [{ torneoId: null }, { torneoId: { not: torneo.id } }] },
      select: { id: true, jugadorId: true, etapaId: true, puntos: true, fecha: true },
    }),
  ]);
  const tabla: TablaDePuntos = Object.fromEntries(organizacion.puntajes.map((p) => [p.instancia.toLowerCase(), p.puntos]));

  return {
    torneoId: torneo.id,
    torneo: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    torneoDelCalendario: torneo.etapa.nombre,
    jugadorId: elJugador.id,
    nombre: elJugador.nombre,
    apellido: elJugador.apellido,
    situacion: situacionDe(jugadorId),
    ...proyectar({
      jugadorId,
      alcanzables: new Map(participantes.map((j) => [j.id, instanciasAlcanzables(situacionDe(j.id), rondas)])),
      tabla,
      deLaCategoria,
      movimientos,
      etapaId: torneo.etapa.id,
      ahora: new Date(),
    }),
  };
}

// Con el sorteo confirmado, las zonas como quedaron. Antes, las del formato publicado, llenas: si
// no se llena el cupo se arman igual esas zonas, más chicas (decisión 015).
function tamanosDeLasZonas(
  torneo: { sorteoConfirmado: boolean; cantidadGrupos: number; clasificanPorGrupo: number },
  participantes: { grupo: string | null }[],
) {
  if (!torneo.sorteoConfirmado) return Array<number>(torneo.cantidadGrupos).fill(torneo.clasificanPorGrupo);
  const porZona = new Map<string, number>();
  for (const { grupo } of participantes) porZona.set(grupo!, (porZona.get(grupo!) ?? 0) + 1);
  return [...porZona.values()];
}
