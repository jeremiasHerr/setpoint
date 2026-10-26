import { EstadoInscripcion } from '@prisma/client';
import type { EstadoDeLaInscripcion } from '@setpoint/shared';

// Las transiciones de una inscripción que no dependen de la base (decisión 054). Las usan el pago,
// el vencimiento de reservas, el cierre de la inscripción y la cuenta de la app.

type Inscripcion = { estado: EstadoInscripcion; reservaVence: Date | null; resueltaEn: Date | null };

export function reservaVigente(inscripcion: Inscripcion, ahora: Date) {
  return (
    inscripcion.estado === EstadoInscripcion.PENDIENTE_PAGO && (!inscripcion.reservaVence || inscripcion.reservaVence > ahora)
  );
}

// Cómo se ve cada estado en la pantalla de pago y en la app. La tarea que vence las reservas corre
// cada minuto: mientras tanto, una vencida se calcula.
export function estadoDe(inscripcion: Inscripcion, ahora = new Date()): EstadoDeLaInscripcion {
  switch (inscripcion.estado) {
    case EstadoInscripcion.PAGADA:
      return 'pagada';
    case EstadoInscripcion.RECHAZADA:
      return 'rechazada';
    case EstadoInscripcion.CANCELADA:
      return 'cancelada';
    case EstadoInscripcion.SOLICITADA:
      return 'solicitada';
    case EstadoInscripcion.APROBADA:
      return 'aprobada';
    case EstadoInscripcion.NO_APROBADA:
      return 'no_aprobada';
    case EstadoInscripcion.PENDIENTE_PAGO:
      return reservaVigente(inscripcion, ahora) ? 'reservando' : 'vencida';
    default:
      return 'vencida';
  }
}

// Una reserva que vence. Si salió de una solicitud aprobada, vuelve a "aprobada": puede volver a
// abrir el link mientras la inscripción siga abierta. Si no, vence y el perfil pendiente se descarta.
export function alVencer(inscripcion: Pick<Inscripcion, 'resueltaEn'>): 'volver_a_aprobada' | 'expirar' {
  return inscripcion.resueltaEn ? 'volver_a_aprobada' : 'expirar';
}

// Al cerrar la inscripción, lo que todavía no ocupaba lugar se cierra con ella: la solicitud que
// nadie aprobó y la aprobada que no se pagó. Las reservas vigentes no se tocan (decisión 024).
export function alCerrarLaInscripcion(estado: EstadoInscripcion): EstadoInscripcion | null {
  if (estado === EstadoInscripcion.SOLICITADA) return EstadoInscripcion.NO_APROBADA;
  if (estado === EstadoInscripcion.APROBADA) return EstadoInscripcion.EXPIRADA;
  return null;
}

// Las que la app avisa una vez: una solicitud no aprobada o una reserva vencida, salvo que después
// se haya inscripto en ese mismo torneo.
export function avisosPendientes<T extends Inscripcion & { torneoId: number }>(inscripciones: T[], desde: Date): T[] {
  const sigueEnElTorneo = new Set(
    inscripciones.filter((i) => i.estado === EstadoInscripcion.PAGADA || estadoEnCurso(i, new Date())).map((i) => i.torneoId),
  );
  return inscripciones.filter(
    (i) =>
      (i.estado === EstadoInscripcion.NO_APROBADA || i.estado === EstadoInscripcion.EXPIRADA) &&
      i.resueltaEn !== null &&
      i.resueltaEn >= desde &&
      !sigueEnElTorneo.has(i.torneoId),
  );
}

// En curso: todavía no es un lugar confirmado, pero tampoco terminó.
export function estadoEnCurso(inscripcion: Inscripcion, ahora: Date) {
  return (
    inscripcion.estado === EstadoInscripcion.SOLICITADA ||
    inscripcion.estado === EstadoInscripcion.APROBADA ||
    reservaVigente(inscripcion, ahora)
  );
}
