import { EstadoInscripcion } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { alVencer } from '../inscripcion/estados';
import { descartarPerfil } from '../inscripcion/perfil-pendiente';
import { avisarLugaresLiberados, promoverListaDeEspera } from '../inscripciones/lista-de-espera.service';

// Las reservas sin pagar vencen a los minutos que configura el torneo (por defecto, 15). Esta tarea
// las pasa a vencidas cada minuto: así liberan el lugar también en la pantalla de la organización.
const CADA_MINUTO = 60 * 1000;

// Una reserva que salió de una solicitud aprobada vuelve a "aprobada"; las demás vencen, y el perfil
// pendiente de quien no estaba en el padrón se descarta (decisión 054). En los dos casos el lugar se
// libera y pasa al primero de la lista de espera (decisión 076). También vence así la reserva de 24
// horas de quien venía de la lista: el lugar pasa al siguiente.
export async function vencerReservas(ahora = new Date()) {
  const vencidas = await prisma.inscripcion.findMany({
    where: { estado: EstadoInscripcion.PENDIENTE_PAGO, reservaVence: { lte: ahora } },
    select: { id: true, torneoId: true, jugadorId: true, resueltaEn: true },
  });

  for (const inscripcion of vencidas) {
    const liberados = await prisma.$transaction(async (tx) => {
      // Con el estado en la condición, un pago que se confirma justo ahora no se pisa.
      const donde = { id: inscripcion.id, estado: EstadoInscripcion.PENDIENTE_PAGO, reservaVence: { lte: ahora } };
      if (alVencer(inscripcion) === 'volver_a_aprobada') {
        const { count } = await tx.inscripcion.updateMany({ where: donde, data: { estado: EstadoInscripcion.APROBADA, reservaVence: null } });
        return count > 0 ? promoverListaDeEspera(tx, inscripcion.torneoId, ahora) : [];
      }
      const { count } = await tx.inscripcion.updateMany({ where: donde, data: { estado: EstadoInscripcion.EXPIRADA, resueltaEn: ahora } });
      if (count === 0) return [];
      await descartarPerfil(tx, inscripcion.jugadorId);
      return promoverListaDeEspera(tx, inscripcion.torneoId, ahora);
    });
    await avisarLugaresLiberados(liberados);
  }
  return vencidas.length;
}

export function programarVencimientoDeReservas() {
  const revisar = () => vencerReservas().catch((error) => console.error('No se pudieron vencer las reservas', error));
  void revisar();
  setInterval(revisar, CADA_MINUTO).unref();
}
