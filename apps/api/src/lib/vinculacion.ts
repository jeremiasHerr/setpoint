import { EstadoInscripcion, EstadoTorneo, type Prisma, Vinculacion } from '@prisma/client';
import type { ComoSeVinculo } from '@setpoint/shared';

// Lo que comparten el padrón y Revisar vinculación sobre la cuenta de un perfil (decisión 051).

export const COMO_SE_VINCULO: Record<Vinculacion, ComoSeVinculo> = {
  LINK_PERSONAL: 'link_personal',
  BUSQUEDA: 'busqueda',
  PROPUESTA: 'propuesta',
  ORGANIZACION: 'organizacion',
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
