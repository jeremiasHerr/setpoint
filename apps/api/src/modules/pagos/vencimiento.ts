import { EstadoInscripcion } from '@prisma/client';
import { prisma } from '../../lib/prisma';

// Las reservas sin pagar vencen a los minutos que configura el torneo (por defecto, 15). Esta tarea
// las pasa a vencidas cada minuto: así liberan el lugar también en la pantalla de la organización.
const CADA_MINUTO = 60 * 1000;

export async function vencerReservas(ahora = new Date()) {
  const { count } = await prisma.inscripcion.updateMany({
    where: { estado: EstadoInscripcion.PENDIENTE_PAGO, reservaVence: { lte: ahora } },
    data: { estado: EstadoInscripcion.EXPIRADA },
  });
  return count;
}

export function programarVencimientoDeReservas() {
  const revisar = () => vencerReservas().catch((error) => console.error('No se pudieron vencer las reservas', error));
  void revisar();
  setInterval(revisar, CADA_MINUTO).unref();
}
