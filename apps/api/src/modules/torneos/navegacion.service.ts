import { EstadoTorneo, FasePartido } from '@prisma/client';
import type { EstadoTorneo as ClaveEstado, NavegacionDelTorneo } from '@setpoint/shared';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { cuadrosTerminados } from '../competencia/cierre';
import { convocatoriaEditable, pestanasDisponibles } from './navegacion';

// La franja de pestañas de las pantallas del torneo (decisión 095). La piden las cinco pantallas,
// así que lee solo lo que necesita: el estado del torneo y de su convocatoria, y los partidos de los
// cuadros únicamente si puede estar para cerrarse.
export async function obtenerNavegacion(slug: string, usuarioId: number, torneoId: number): Promise<NavegacionDelTorneo> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({
    where: { id: torneoId, organizacionId },
    select: { id: true, nombre: true, edicion: true, estado: true, categoria: { select: { nombre: true } } },
  });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // Los torneos de una convocatoria comparten `edicion`, y el primero la representa (decisión 003).
  const convocatoria = await prisma.torneo.findMany({
    where: torneo.edicion === null ? { id: torneo.id } : { organizacionId, edicion: torneo.edicion },
    orderBy: { id: 'asc' },
    select: { id: true, estado: true },
  });

  const partidosDeLosCuadros =
    torneo.estado === EstadoTorneo.ELIMINATORIAS
      ? await prisma.partido.findMany({
          where: { torneoId: torneo.id, fase: FasePartido.ELIMINATORIA },
          select: { cuadro: true, ronda: true, jugadorAId: true, jugadorBId: true, ganadorId: true, estado: true },
        })
      : [];
  const campeonesDefinidos = cuadrosTerminados(partidosDeLosCuadros.map((p) => ({ ...p, cuadro: p.cuadro!, ronda: p.ronda! })));

  return {
    torneoId: torneo.id,
    convocatoriaId: convocatoria[0].id,
    nombre: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    estado: torneo.estado.toLowerCase() as ClaveEstado,
    sePuedeEditar: convocatoriaEditable(convocatoria.map((t) => t.estado)),
    disponibles: pestanasDisponibles(torneo.estado, campeonesDefinidos),
  };
}
