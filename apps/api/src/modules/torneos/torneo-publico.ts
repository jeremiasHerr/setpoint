import { EstadoInscripcion, EstadoTorneo, type Prisma } from '@prisma/client';
import type { Contacto, TorneoPublico } from '@setpoint/shared';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

const OCUPAN_CUPO = [EstadoInscripcion.PAGADA, EstadoInscripcion.PENDIENTE_PAGO];

// Un borrador o un torneo cancelado no se publican: para el link es como si no existieran.
export const NO_PUBLICOS: EstadoTorneo[] = [EstadoTorneo.BORRADOR, EstadoTorneo.CANCELADO];

// Lo que hace falta leer de cada torneo para mostrar su convocatoria.
export const CONVOCATORIA = {
  organizacion: { select: { nombre: true, slug: true, contactos: { orderBy: { orden: 'asc' }, select: { tipo: true, valor: true } } } },
  categoria: { select: { nombre: true, suelta: true } },
  _count: { select: { inscripciones: { where: { estado: { in: OCUPAN_CUPO } } } } },
  // Los de la lista de espera, para contarlos: _count admite un solo filtro por relación.
  inscripciones: { where: { estado: EstadoInscripcion.EN_LISTA_ESPERA }, select: { id: true } },
} satisfies Prisma.TorneoInclude;

type TorneoConConvocatoria = Prisma.TorneoGetPayload<{ include: typeof CONVOCATORIA }>;

export function aTorneoPublico(torneo: TorneoConConvocatoria): TorneoPublico {
  return {
    id: torneo.id,
    slugPublico: torneo.slugPublico,
    organizacion: {
      ...torneo.organizacion,
      contactos: torneo.organizacion.contactos.map((c) => ({ tipo: c.tipo.toLowerCase() as Contacto['tipo'], valor: c.valor })),
    },
    nombre: torneo.edicion ?? torneo.nombre,
    categoria: torneo.categoria.nombre,
    suelto: torneo.categoria.suelta,
    inscripcion: torneo.estado === EstadoTorneo.PUBLICADO ? 'abierta' : 'cerrada',
    modoInscripcion: torneo.modoInscripcion.toLowerCase() as TorneoPublico['modoInscripcion'],
    cierreInscripcion: torneo.cierreInscripcion?.toISOString().slice(0, 10) ?? null,
    fechaInicio: torneo.fechaInicio?.toISOString().slice(0, 10) ?? null,
    cantidadGrupos: torneo.cantidadGrupos,
    tieneCuadroConsuelo: torneo.tieneComplementaria,
    cupo: torneo.cupo,
    ocupados: torneo._count.inscripciones,
    precio: torneo.precio.toNumber(),
    minutosReserva: torneo.minutosReservaCupo,
    listaDeEspera: torneo.tieneListaEspera
      ? { personas: torneo.inscripciones.length, horas: torneo.horasReservaListaEspera }
      : null,
    descripcion: torneo.descripcion || null,
  };
}

// El torneo se busca por su slug, el del link con nombre (decisión 140), o por su número, el de los
// links de antes, que siguen andando. Un slug nunca es solo números, así que no se confunden.
export async function torneoPublico(slug: string, torneoONumero: string): Promise<TorneoPublico> {
  const porNumero = /^\d+$/.test(torneoONumero);
  const torneo = await prisma.torneo.findFirst({
    // El slug de la organización va en el filtro: el del torneo solo no alcanza para saber de cuál es.
    where: { ...(porNumero ? { id: Number(torneoONumero) } : { slugPublico: torneoONumero }), organizacion: { slug } },
    include: CONVOCATORIA,
  });
  if (!torneo || NO_PUBLICOS.includes(torneo.estado)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  return aTorneoPublico(torneo);
}
