import type { RespuestaRegistro } from '@setpoint/shared';

// En localStorage por simplicidad. Queda para revisar: docs/README.md, decisión abierta 13.
const CLAVE_SESION = 'setpoint.sesion';

export type Sesion = RespuestaRegistro;

export function guardarSesion(sesion: Sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
  }
}
