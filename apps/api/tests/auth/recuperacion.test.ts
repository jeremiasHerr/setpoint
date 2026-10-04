import { beforeAll, describe, expect, it } from 'vitest';
import { recuperarContrasenaSchema, restablecerContrasenaSchema } from '@setpoint/shared';

// token.ts lee el secreto al importarse: se define antes y se importa adentro.
let token: typeof import('../../src/lib/token');

beforeAll(async () => {
  process.env.JWT_SECRET ??= 'secreto-de-prueba';
  token = await import('../../src/lib/token');
});

const HASH = '$2a$10$hashDeLaContrasenaActual';
const HASH_NUEVO = '$2a$10$hashDeLaContrasenaNueva';

describe('token de recuperación', () => {
  it('vale mientras la contraseña sea la misma', () => {
    const link = token.firmarTokenRecuperacion(42, HASH);
    expect(token.usuarioDeTokenRecuperacion(link)).toBe(42);
    expect(token.tokenRecuperacionValido(link, HASH)).toBe(true);
  });

  it('deja de valer cuando la contraseña cambia: el link sirve una sola vez', () => {
    const link = token.firmarTokenRecuperacion(42, HASH);
    expect(token.tokenRecuperacionValido(link, HASH_NUEVO)).toBe(false);
  });

  it('no sirve como token de sesión', () => {
    const link = token.firmarTokenRecuperacion(42, HASH);
    expect(token.verificarToken(link)).toBeNull();
  });

  it('un token de sesión no sirve para cambiar la contraseña', () => {
    const sesion = token.firmarToken(42);
    expect(token.tokenRecuperacionValido(sesion, HASH)).toBe(false);
  });

  it('rechaza un link inventado', () => {
    expect(token.usuarioDeTokenRecuperacion('no-es-un-token')).toBeNull();
    expect(token.tokenRecuperacionValido('no-es-un-token', HASH)).toBe(false);
  });
});

describe('schemas de recuperación', () => {
  it('normaliza el email igual que el ingreso', () => {
    expect(recuperarContrasenaSchema.parse({ email: '  Ana@Polenta.AR ' })).toEqual({ email: 'ana@polenta.ar' });
  });

  it('pide una contraseña nueva de al menos 8 caracteres', () => {
    expect(restablecerContrasenaSchema.safeParse({ token: 'x', contrasena: 'corta' }).success).toBe(false);
    expect(restablecerContrasenaSchema.safeParse({ token: 'x', contrasena: 'bien-larga' }).success).toBe(true);
  });

  it('pide el token del link', () => {
    expect(restablecerContrasenaSchema.safeParse({ token: '', contrasena: 'bien-larga' }).success).toBe(false);
  });
});
