import { ErrorApi } from '../../lib/api';

// Por qué no se pudo reservar el lugar, desde el link del torneo o desde el link personal.
export function mensajeReserva(error: Error | null): string | null {
  if (!error) return null;
  if (!(error instanceof ErrorApi)) return 'Algo salió mal. Probá de nuevo.';
  switch (error.codigo) {
    case 'SIN_LUGARES':
      return 'Ya no quedan lugares en este torneo.';
    case 'PERFIL_RESERVADO':
      return 'Alguien está pagando con ese perfil en este momento. Si es el tuyo, avisale a la organización.';
    case 'PERFIL_VINCULADO':
      return 'Ese perfil ya está vinculado a otra cuenta.';
    case 'YA_TENES_PERFIL':
      return 'Tu cuenta ya tiene otro perfil en este circuito. Escribile a la organización.';
    case 'OTRA_CATEGORIA':
      return 'Ese perfil es de otra categoría. Si te corresponde esta, hablá con la organización.';
    case 'OTRO_PERFIL_RESERVADO':
      return 'Ya tenés otro perfil reservado en este circuito. Terminá ese pago o esperá a que venza la reserva.';
    case 'INSCRIPCION_EN_CURSO':
      return 'Ya tenés una inscripción en curso en este circuito. Esperá a que se resuelva.';
    case 'SOLO_PADRON':
      return 'Este torneo es solo para los jugadores del padrón. Pedile a la organización que te agregue.';
    case 'YA_INSCRIPTO':
      return 'Ese perfil ya está inscripto en este torneo.';
    case 'LINK_NO_ENCONTRADO':
      return 'Este link ya no anda: la organización generó uno nuevo. Pedile el tuyo.';
    case 'INSCRIPCION_NO_ABIERTA':
      return 'La inscripción de este torneo ya cerró.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos reservar el lugar. Probá de nuevo en unos minutos.';
  }
}
