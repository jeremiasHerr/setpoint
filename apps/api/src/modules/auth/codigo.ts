import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

// Reglas del código con el que entra el jugador (decisión 049).
export const MINUTOS_DE_VALIDEZ = 10;
export const INTENTOS_MAXIMOS = 5;

export function generarCodigo() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

// "482913" -> "482 913", como se lee en el email y en la pantalla.
export function codigoParaLeer(codigo: string) {
  return `${codigo.slice(0, 3)} ${codigo.slice(3)}`;
}

// HMAC con el secreto de la API y no un hash simple: hay solo un millón de códigos posibles, y sin
// secreto se recuperan probándolos todos si alguien se lleva la tabla.
export function hashDeCodigo(email: string, codigo: string) {
  return createHmac('sha256', process.env.JWT_SECRET!).update(`${email}:${codigo}`).digest('hex');
}

type CodigoGuardado = {
  email: string;
  codigoHash: string;
  intentos: number;
  venceEn: Date;
  usadoEn: Date | null;
};

export type ResultadoIntento =
  | { ok: true }
  | { ok: false; motivo: 'vencido' }
  | { ok: false; motivo: 'agotado' }
  | { ok: false; motivo: 'incorrecto'; quedan: number };

// Qué pasa con un intento, sin tocar la base. Un código que no existe, ya usado o vencido se trata
// igual: hay que pedir otro.
export function revisarIntento(guardado: CodigoGuardado | null, codigo: string, ahora = new Date()): ResultadoIntento {
  if (!guardado || guardado.usadoEn || guardado.venceEn <= ahora) return { ok: false, motivo: 'vencido' };
  if (guardado.intentos >= INTENTOS_MAXIMOS) return { ok: false, motivo: 'agotado' };

  const esperado = Buffer.from(guardado.codigoHash, 'hex');
  const recibido = Buffer.from(hashDeCodigo(guardado.email, codigo), 'hex');
  if (esperado.length === recibido.length && timingSafeEqual(esperado, recibido)) return { ok: true };

  // Este intento también cuenta.
  const quedan = INTENTOS_MAXIMOS - guardado.intentos - 1;
  return quedan > 0 ? { ok: false, motivo: 'incorrecto', quedan } : { ok: false, motivo: 'agotado' };
}
