import { ErrorApi } from '../../lib/api';

// Por qué no salió una acción de Inscripciones. Casi todas pasan porque otra pestaña ya cambió
// algo: la pantalla se vuelve a pedir sola.
export function textoDelError(error: Error) {
  const codigo = error instanceof ErrorApi ? error.codigo : '';
  switch (codigo) {
    case 'SORTEO_CONFIRMADO':
      return 'Las zonas ya se sortearon: quien no juega pierde sus partidos por W.O. desde el tablero.';
    case 'INSCRIPCION_NO_ABIERTA':
      return 'La inscripción no está abierta.';
    case 'INSCRIPCION_NO_ENCONTRADA':
      return 'Esa inscripción ya no estaba pagada. La lista se actualizó.';
    case 'RESERVA_NO_ENCONTRADA':
      return 'Esa reserva ya venció o se pagó. La lista se actualizó.';
    case 'SIN_EMAIL':
      return 'No tiene un email al que mandarle el recordatorio.';
    case 'SIN_DEVOLUCION_PENDIENTE':
      return 'Esa devolución ya estaba marcada.';
    case 'SIN_LUGARES':
      return 'No quedan lugares libres en esta categoría.';
    case 'YA_INSCRIPTO':
      return 'Ese jugador ya está inscripto.';
    case 'DADO_DE_BAJA':
      return 'Ese jugador se dio de baja en este torneo y no se puede volver a inscribir a mano.';
    case 'OTRA_CATEGORIA':
      return 'Ese jugador es de otra categoría.';
    case 'JUGADOR_NO_ENCONTRADO':
      return 'Ese jugador ya no está en el padrón.';
    case 'CONFLICTO':
      return 'Otro cambio llegó al mismo tiempo. Probá de nuevo.';
    case 'SIN_CONEXION':
      return 'No hay conexión. Probá de nuevo.';
    default:
      return 'No se pudo guardar. Probá de nuevo.';
  }
}
