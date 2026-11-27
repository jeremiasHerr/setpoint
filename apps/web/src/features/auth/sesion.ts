import type { RespuestaRegistro } from '@setpoint/shared';

// En localStorage por simplicidad. Queda para revisar: docs/README.md, decisión abierta 13.
const CLAVE_SESION = 'setpoint.sesion';

export type Sesion = RespuestaRegistro;

// Respaldo en memoria si el navegador bloquea localStorage (modo privado o webview restringido).
let sesionEnMemoria: Sesion | null = null;

export function guardarSesion(sesion: Sesion) {
  sesionEnMemoria = sesion;
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
  }
}

export function leerSesion(): Sesion | null {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
    if (sesion?.token && sesion?.organizacion?.slug) {
      sesionEnMemoria = sesion;
      return sesion;
    }
    return sesionEnMemoria;
  } catch {
    return sesionEnMemoria;
  }
}

// A dónde lleva el logo de las páginas públicas (decisión 157): quien administra vuelve a su Inicio;
// quien no tiene sesión, a la página de Setpoint.
export function inicioDeSetpoint() {
  return leerSesion() ? '/inicio' : '/';
}

export function borrarSesion() {
  sesionEnMemoria = null;
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que borrar.
  }
}
