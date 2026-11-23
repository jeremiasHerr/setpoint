import { EstadoTorneo, type Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { aSlug } from '../../lib/slug';

// El link público del torneo lleva su nombre, no su número: /inscripcion/<organización>/<slug>
// (decisión 140). El slug se arma al publicar y queda fijo, aunque después cambie el nombre, para no
// romper los links que ya circulan por el grupo.

type TorneoParaSlug = {
  id: number;
  organizacionId: number;
  nombre: string;
  edicion: string | null;
  slugPublico: string | null;
  categoria: { nombre: string };
};

const LARGO_MAXIMO = 60;

// El nombre del torneo y, si la convocatoria tiene varias categorías, la de cada uno:
// "primavera-2026-tercera". Con una sola, el nombre alcanza: "torneo-test-pago".
function slugBase(torneo: TorneoParaSlug, conCategoria: boolean) {
  const nombre = torneo.edicion ?? torneo.nombre;
  const slug = aSlug(conCategoria ? `${nombre} ${torneo.categoria.nombre}` : nombre)
    .slice(0, LARGO_MAXIMO)
    .replace(/-+$/, '');
  if (!slug) return 'torneo';
  // Solo números se confundiría con el id de los links viejos, que siguen andando.
  return /^\d+$/.test(slug) ? `torneo-${slug}` : slug;
}

// Le da su slug a cada torneo de la convocatoria que todavía no tiene. Si ya lo usa otro torneo de
// la organización (otro año con el mismo nombre), prueba -2, -3...
export async function asignarSlugs(tx: Prisma.TransactionClient, torneos: TorneoParaSlug[], conCategoria: boolean) {
  const sinSlug = torneos.filter((t) => t.slugPublico === null);
  if (sinSlug.length === 0) return;

  const usados = await tx.torneo.findMany({
    where: { organizacionId: sinSlug[0].organizacionId, slugPublico: { not: null } },
    select: { slugPublico: true },
  });
  const tomados = new Set(usados.map((t) => t.slugPublico));

  for (const torneo of sinSlug) {
    const base = slugBase(torneo, conCategoria);
    let slug = base;
    for (let n = 2; tomados.has(slug); n++) slug = `${base}-${n}`;
    tomados.add(slug);
    await tx.torneo.update({ where: { id: torneo.id }, data: { slugPublico: slug } });
  }
}

// Los torneos publicados antes de la decisión 140 no tienen slug: se les da al arrancar la API.
// También a los del seed, que se cargan ya publicados.
export async function asignarSlugsFaltantes() {
  const torneos = await prisma.torneo.findMany({
    where: { slugPublico: null, estado: { notIn: [EstadoTorneo.BORRADOR, EstadoTorneo.CANCELADO] } },
    include: { categoria: { select: { nombre: true } } },
    orderBy: { id: 'asc' },
  });

  // Por convocatoria: la misma organización y la misma edición. Sin edición, cada torneo es la suya.
  const convocatorias = new Map<string, typeof torneos>();
  for (const torneo of torneos) {
    const clave = torneo.edicion === null ? `torneo:${torneo.id}` : `${torneo.organizacionId}:${torneo.edicion}`;
    convocatorias.set(clave, [...(convocatorias.get(clave) ?? []), torneo]);
  }

  for (const grupo of convocatorias.values()) {
    const [primero] = grupo;
    const categorias =
      primero.edicion === null ? 1 : await prisma.torneo.count({ where: { organizacionId: primero.organizacionId, edicion: primero.edicion } });
    await prisma.$transaction((tx) => asignarSlugs(tx, grupo, categorias > 1));
  }
  return torneos.length;
}
