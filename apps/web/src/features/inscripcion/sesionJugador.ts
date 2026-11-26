import { respuestaCodigoSchema, type RespuestaCodigo } from '@setpoint/shared';

// La sesión que deja el código al inscribirse desde el link (decisión 049). Va aparte de la del
// administrador: en la misma computadora alguien puede administrar un circuito e inscribirse en otro.
// En localStorage, como la otra (decisión abierta 13).
const CLAVE = 'setpoint.jugador';

export type SesionJugador = RespuestaCodigo;

// Respaldo en memoria si el navegador bloquea localStorage (modo privado o webview restringido).
let sesionEnMemoria: SesionJugador | null = null;

export function guardarSesionJugador(sesion: SesionJugador) {
  sesionEnMemoria = sesion;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
  }
}

export function leerSesionJugador(): SesionJugador | null {
  try {
    const resultado = respuestaCodigoSchema.safeParse(JSON.parse(localStorage.getItem(CLAVE) ?? 'null'));
    if (resultado.success) {
      sesionEnMemoria = resultado.data;
      return resultado.data;
    }
    return sesionEnMemoria;
  } catch {
    return sesionEnMemoria;
  }
}

export function borrarSesionJugador() {
  sesionEnMemoria = null;
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}
