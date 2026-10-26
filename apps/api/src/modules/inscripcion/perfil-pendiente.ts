import { EstadoJugador, type Prisma } from '@prisma/client';

// El perfil de quien no estaba en el padrón (decisión 054): se crea pendiente con la solicitud o la
// reserva, entra al padrón al pagar y, si se abandona, se descarta.

type Tx = Prisma.TransactionClient;

export function crearPerfilPendiente(
  tx: Tx,
  datos: { organizacionId: number; categoriaId: number; usuarioId: number; nombre: string; apellido: string },
) {
  return tx.jugador.create({ data: { ...datos, estado: EstadoJugador.PENDIENTE } });
}

// No se borra: la inscripción conserva su jugador y queda el historial. Suelta la cuenta, que la
// inscripción guarda en usuarioId: una persona tiene un solo perfil por organización, y el
// descartado no puede impedirle volver a inscribirse ni que la organización la vincule.
export function descartarPerfil(tx: Tx, jugadorId: number) {
  return tx.jugador.updateMany({
    where: { id: jugadorId, estado: EstadoJugador.PENDIENTE },
    data: { estado: EstadoJugador.DESCARTADO, usuarioId: null },
  });
}

// Al confirmarse el pago, el perfil entra al padrón con 0 puntos. Si se había descartado (un pago
// que llega después de vencer la reserva), vuelve con su cuenta, salvo que la persona ya tenga
// otro perfil en la organización.
export async function entrarAlPadron(tx: Tx, jugador: { id: number; organizacionId: number; estado: EstadoJugador }, usuarioId: number | null) {
  if (jugador.estado === EstadoJugador.PADRON) return;
  const otro = usuarioId
    ? await tx.jugador.findFirst({ where: { organizacionId: jugador.organizacionId, usuarioId, id: { not: jugador.id } } })
    : null;
  await tx.jugador.update({
    where: { id: jugador.id },
    data: { estado: EstadoJugador.PADRON, ...(usuarioId && !otro ? { usuarioId } : {}) },
  });
}
