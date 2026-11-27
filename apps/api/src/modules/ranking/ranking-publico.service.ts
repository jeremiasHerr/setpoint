import type { RankingPublico } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { tablaDeCategoria, temporadaDeCategoria } from './ranking';

// Ranking de todas las categorías de la organización, sin login (F09). Como en el padrón,
// cada jugador figura en la categoría en la que está hoy y solo con los puntos de esa
// categoría; los de baja no figuran. Nunca devuelve datos de contacto.
export async function rankingPublico(slug: string): Promise<RankingPublico> {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    select: { id: true, nombre: true, usaRanking: true },
  });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (!organizacion.usaRanking) {
    return { organizacion: organizacion.nombre, usaRanking: false, torneosDelCalendario: [], categorias: [] };
  }

  const organizacionId = organizacion.id;
  const [etapas, categorias, jugadores, movimientos, torneos] = await Promise.all([
    prisma.etapa.findMany({ where: { organizacionId, activa: true }, orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
    prisma.categoria.findMany({ where: { organizacionId, activa: true, suelta: false }, orderBy: { orden: 'asc' }, select: { id: true, nombre: true } }),
    prisma.jugador.findMany({
      where: { organizacionId, ...DEL_PADRON_ACTIVOS, categoriaId: { not: null } },
      select: { id: true, nombre: true, apellido: true, categoriaId: true },
    }),
    prisma.movimientoRanking.findMany({
      where: { organizacionId },
      select: { id: true, jugadorId: true, categoriaId: true, etapaId: true, puntos: true, fecha: true },
    }),
    // Para el encabezado de la temporada: los publicados y los que se están jugando (decisión 159).
    prisma.torneo.findMany({
      where: {
        organizacionId,
        estado: { in: ['PUBLICADO', 'INSCRIPCIONES_CERRADAS', 'ZONAS_GENERADAS', 'GRUPOS_EN_CURSO', 'ELIMINATORIAS'] },
      },
      select: {
        id: true,
        slugPublico: true,
        nombre: true,
        edicion: true,
        estado: true,
        etapaId: true,
        categoriaId: true,
        fechaInicio: true,
        cierreInscripcion: true,
      },
    }),
  ]);

  return {
    organizacion: organizacion.nombre,
    usaRanking: true,
    torneosDelCalendario: etapas,
    categorias: categorias.map((categoria) => {
      const deLaCategoria = jugadores.filter((j) => j.categoriaId === categoria.id);
      const ids = new Set(deLaCategoria.map((j) => j.id));
      const suyos = movimientos.filter((m) => m.categoriaId === categoria.id && ids.has(m.jugadorId));
      // El nombre, como en la página del torneo: la edición, o el nombre si es suelto.
      const suyosTorneos = torneos
        .filter((t) => t.categoriaId === categoria.id)
        .map((t) => ({ ...t, nombre: t.edicion ?? t.nombre }));
      return { ...categoria, filas: tablaDeCategoria(deLaCategoria, suyos), ...temporadaDeCategoria(suyosTorneos) };
    }),
  };
}
