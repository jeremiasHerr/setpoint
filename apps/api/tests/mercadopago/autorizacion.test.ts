import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pkce, sePuedeConectarMercadoPago, urlDeAutorizacion } from '../../src/lib/mercadopago';

const VARIABLES = ['MERCADOPAGO_CLIENT_ID', 'MERCADOPAGO_CLIENT_SECRET', 'API_URL_PUBLICA'] as const;

describe('autorización en MercadoPago', () => {
  const antes = Object.fromEntries(VARIABLES.map((v) => [v, process.env[v]]));
  beforeEach(() => {
    process.env.MERCADOPAGO_CLIENT_ID = '1234567890';
    process.env.MERCADOPAGO_CLIENT_SECRET = 'secreto';
    process.env.API_URL_PUBLICA = 'https://api.setpoint.com.ar';
  });
  afterEach(() => {
    // Asignarle undefined la dejaría con el texto "undefined".
    for (const v of VARIABLES) {
      if (antes[v] === undefined) delete process.env[v];
      else process.env[v] = antes[v];
    }
  });

  it('el desafío de PKCE es el SHA-256 del verificador, en base64url', () => {
    const { verificador, desafio } = pkce();
    expect(verificador).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(desafio).toBe(createHash('sha256').update(verificador).digest('base64url'));
  });

  it('el link lleva la aplicación, el state, la vuelta de la API y el desafío con S256', () => {
    const url = new URL(urlDeAutorizacion({ estado: 'estado-1', desafio: 'desafio-1' }));
    expect(url.origin + url.pathname).toBe('https://auth.mercadopago.com/authorization');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: '1234567890',
      response_type: 'code',
      platform_id: 'mp',
      state: 'estado-1',
      redirect_uri: 'https://api.setpoint.com.ar/api/mercadopago/vuelta',
      code_challenge: 'desafio-1',
      code_challenge_method: 'S256',
    });
  });

  it('sin el secreto de la aplicación no se puede conectar', () => {
    delete process.env.MERCADOPAGO_CLIENT_SECRET;
    expect(sePuedeConectarMercadoPago()).toBe(false);
  });
});
