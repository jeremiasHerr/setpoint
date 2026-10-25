import { randomBytes } from 'node:crypto';

// 12 bytes al azar, 16 caracteres en la URL: no se adivina ni se recorre cambiando un número,
// como pasaría con el id del jugador (decisión 050).
export function nuevoCodigoDeLink() {
  return randomBytes(12).toString('base64url');
}

// Un código bien formado, antes de ir a la base.
export function pareceCodigoDeLink(codigo: string) {
  return /^[A-Za-z0-9_-]{16}$/.test(codigo);
}
