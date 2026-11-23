import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cifrar, descifrar, hayClaveDeCifrado } from '../../src/lib/cifrado';

const CLAVE = 'a'.repeat(64);

describe('cifrado de los tokens de MercadoPago', () => {
  const antes = process.env.CLAVE_TOKENS_MERCADOPAGO;
  beforeEach(() => {
    process.env.CLAVE_TOKENS_MERCADOPAGO = CLAVE;
  });
  afterEach(() => {
    // Asignarle undefined la dejaría con el texto "undefined".
    if (antes === undefined) delete process.env.CLAVE_TOKENS_MERCADOPAGO;
    else process.env.CLAVE_TOKENS_MERCADOPAGO = antes;
  });

  it('descifra lo que cifró', () => {
    expect(descifrar(cifrar('APP_USR-123-token'))).toBe('APP_USR-123-token');
  });

  it('el texto guardado no contiene el token, y cambia en cada cifrado', () => {
    const una = cifrar('APP_USR-123-token');
    expect(una).not.toContain('APP_USR');
    expect(cifrar('APP_USR-123-token')).not.toBe(una);
  });

  it('rechaza un texto que alguien tocó', () => {
    const [version, iv, etiqueta, datos] = cifrar('APP_USR-123-token').split('.');
    const otro = Buffer.from(datos, 'base64url');
    otro[0] ^= 1;
    expect(() => descifrar([version, iv, etiqueta, otro.toString('base64url')].join('.'))).toThrow();
  });

  it('con otra clave no se descifra', () => {
    const guardado = cifrar('APP_USR-123-token');
    process.env.CLAVE_TOKENS_MERCADOPAGO = 'b'.repeat(64);
    expect(() => descifrar(guardado)).toThrow();
  });

  it('sin clave, o con una que no es de 32 bytes, no cifra y lo dice', () => {
    process.env.CLAVE_TOKENS_MERCADOPAGO = '';
    expect(hayClaveDeCifrado()).toBe(false);
    expect(() => cifrar('x')).toThrow(/CLAVE_TOKENS_MERCADOPAGO/);
    process.env.CLAVE_TOKENS_MERCADOPAGO = 'abc123';
    expect(hayClaveDeCifrado()).toBe(false);
  });
});
