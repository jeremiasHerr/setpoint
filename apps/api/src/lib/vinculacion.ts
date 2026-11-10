import { EstadoInscripcion, EstadoTorneo, MotivoRevision, type Prisma, Vinculacion } from '@prisma/client';
import type { ComoSeVinculo, MotivoDeRevision } from '@setpoint/shared';

// Lo que comparten el padrón, Revisar vinculación e Inscripciones sobre la cuenta de un perfil (decisión 051).

export const COMO_SE_VINCULO: Record<Vinculacion, ComoSeVinculo> = {
  LINK_PERSONAL: 'link_personal',
  BUSQUEDA: 'busqueda',
  PROPUESTA: 'propuesta',
  ORGANIZACION: 'organizacion',
};

export const MOTIVO_DE_REVISION: Record<MotivoRevision, MotivoDeRevision> = {
  [MotivoRevision.HOMONIMO]: 'homonimo',
  [MotivoRevision.RECLAMO]: 'reclamo',
};

// Las inscripciones que todavía cuentan: las pagadas y las reservas vigentes, de torneos que no
// terminaron.
export function inscripcionesVigentes(ahora: Date): Prisma.InscripcionWhereInput {
  return {
    torneo: { estado: { notIn: [EstadoTorneo.FINALIZADO, EstadoTorneo.CANCELADO] } },
    OR: [
      { estado: EstadoInscripcion.PAGADA },
      { estado: EstadoInscripcion.PENDIENTE_PAGO, OR: [{ reservaVence: null }, { reservaVence: { gt: ahora } }] },
    ],
  };
}
