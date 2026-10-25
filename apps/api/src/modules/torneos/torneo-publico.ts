import { EstadoInscripcion, EstadoTorneo, type Prisma } from '@prisma/client';
import type { TorneoPublico } from '@setpoint/shared';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

const OCUPAN_CUPO = [EstadoInscripcion.PAGADA, EstadoInscripcion.PENDIENTE_PAGO];

// Un borrador o un torneo cancelado no se publican: para el link es como si no existieran.
const NO_PUBLICOS: EstadoTorneo[] = [EstadoTorneo.BORRADOR, EstadoTorneo.CANCELADO];

// Lo que hace falta leer de cada torneo para mostrar su convocatoria.
export const CONVOCATORIA = {
  organizacion: { select: { nombre: true, slug: true, contacto: true } },
  categoria: { select: { nombre: true } },
  _count: { select: { inscripciones: { where: { estado: { in: OCUPAN_CUPO } } } } },
} satisfies Prisma.TorneoInclude;

type TorneoConConvocatoria = Prisma.TorneoGetPayload<{ include: typeof CONVOCATORIA }>;

export function aTorneoPublico(torneo: TorneoConConvocatoria): TorneoPublico {
  return {
    id: torneo.id,
    organizacion: torneo.organizacion,
    nombre: torneo.edicion ?? torneo.nombre,
    categoria: torneo.categoria.nombre,
    inscripcion: torneo.estado === EstadoTorneo.PUBLICADO ? 'abierta' : 'cerrada',
    cierreInscripcion: torneo.cierreInscripcion?.toISOString().slice(0, 10) ?? null,
    fechaInicio: torneo.fechaInicio?.toISOString().slice(0, 10) ?? null,
    cantidadGrupos: torneo.cantidadGrupos,
    tieneCuadroConsuelo: torneo.tieneComplementaria,
    cupo: torneo.cupo,
    ocupados: torneo._count.inscripciones,
    precio: torneo.precio.toNumber(),
    minutosReserva: torneo.minutosReservaCupo,
    descripcion: torneo.descripcion || null,
  };
}

export async function torneoPublico(slug: string, torneoId: number): Promise<TorneoPublico> {
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  const torneo = await prisma.torneo.findFirst({
    // El slug va en el filtro: el id solo no alcanza para saber de qué organización es.
    where: { id: torneoId, organizacion: { slug } },
    include: CONVOCATORIA,
  });
  if (!torneo || NO_PUBLICOS.includes(torneo.estado)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  return aTorneoPublico(torneo);
}
