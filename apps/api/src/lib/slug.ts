import type { Prisma } from '@prisma/client';

const SLUG_POR_DEFECTO = 'circuito';

// Mismo algoritmo que la vista previa del formulario de registro,
// para que el slug que ve la organización sea el que se guarda.
export function aSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Si el slug ya está tomado, prueba base-2, base-3, ... hasta encontrar uno libre.
export async function slugDisponible(tx: Prisma.TransactionClient, nombre: string) {
  const base = aSlug(nombre) || SLUG_POR_DEFECTO;
  const tomados = await tx.organizacion.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const usados = new Set(tomados.map((o) => o.slug));

  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
