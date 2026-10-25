import { beforeAll, describe, expect, it } from 'vitest';
import { verificarCodigoSchema } from '@setpoint/shared';

// hashDeCodigo usa el secreto de la API.
let codigo: typeof import('../../src/modules/auth/codigo');

beforeAll(async () => {
  process.env.JWT_SECRET ??= 'secreto-de-prueba';
  codigo = await import('../../src/modules/auth/codigo');
});

const AHORA = new Date('2026-10-25T12:00:00Z');
const EN_5_MINUTOS = new Date('2026-10-25T12:05:00Z');

function guardado(valor: string, cambios: Partial<{ intentos: number; venceEn: Date; usadoEn: Date | null }> = {}) {
  return {
    email: 'lucas.bravo@gmail.com',
    codigoHash: codigo.hashDeCodigo('lucas.bravo@gmail.com', valor),
    intentos: 0,
    venceEn: EN_5_MINUTOS,
    usadoEn: null,
    ...cambios,
  };
}

describe('código de ingreso', () => {
  it('tiene siempre 6 dígitos', () => {
    for (let i = 0; i < 200; i++) expect(codigo.generarCodigo()).toMatch(/^\d{6}$/);
  });

  it('se lee en dos grupos de tres', () => {
    expect(codigo.codigoParaLeer('482913')).toBe('482 913');
  });

  it('el hash depende del email: el mismo código no sirve para otro', () => {
    expect(codigo.hashDeCodigo('a@x.com', '482913')).not.toBe(codigo.hashDeCodigo('b@x.com', '482913'));
  });

  it('acepta el código correcto', () => {
    expect(codigo.revisarIntento(guardado('482913'), '482913', AHORA)).toEqual({ ok: true });
  });

  it('un código incorrecto dice cuántos intentos quedan, contando este', () => {
    expect(codigo.revisarIntento(guardado('482913'), '111111', AHORA)).toEqual({
      ok: false,
      motivo: 'incorrecto',
      quedan: 4,
    });
  });

  it('el quinto intento incorrecto agota el código', () => {
    expect(codigo.revisarIntento(guardado('482913', { intentos: 4 }), '111111', AHORA)).toEqual({
      ok: false,
      motivo: 'agotado',
    });
  });

  it('agotado, ya no sirve ni el correcto', () => {
    expect(codigo.revisarIntento(guardado('482913', { intentos: 5 }), '482913', AHORA)).toEqual({
      ok: false,
      motivo: 'agotado',
    });
  });

  it('vencido no sirve', () => {
    const vencido = guardado('482913', { venceEn: new Date('2026-10-25T11:59:59Z') });
    expect(codigo.revisarIntento(vencido, '482913', AHORA)).toEqual({ ok: false, motivo: 'vencido' });
  });

  it('ya usado no sirve otra vez', () => {
    const usado = guardado('482913', { usadoEn: new Date('2026-10-25T11:58:00Z') });
    expect(codigo.revisarIntento(usado, '482913', AHORA)).toEqual({ ok: false, motivo: 'vencido' });
  });

  it('sin código pedido, hay que pedir uno', () => {
    expect(codigo.revisarIntento(null, '482913', AHORA)).toEqual({ ok: false, motivo: 'vencido' });
  });
});

describe('verificarCodigoSchema', () => {
  it('acepta el código con el espacio del email', () => {
    const datos = verificarCodigoSchema.parse({ email: ' Lucas.Bravo@Gmail.com ', codigo: '482 913' });
    expect(datos).toEqual({ email: 'lucas.bravo@gmail.com', codigo: '482913' });
  });

  it('rechaza lo que no son 6 números', () => {
    expect(verificarCodigoSchema.safeParse({ email: 'a@x.com', codigo: '48291' }).success).toBe(false);
    expect(verificarCodigoSchema.safeParse({ email: 'a@x.com', codigo: '48291a' }).success).toBe(false);
  });
});
