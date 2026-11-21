import { describe, expect, it, vi } from 'vitest';

const { count, aggregate, create, update } = vi.hoisted(() => ({ count: vi.fn(), aggregate: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../src/lib/prisma', () => ({ prisma: { usoIA: { count, aggregate, create, update } } }));

import { ErrorHttp } from '../../src/middleware/errores';
import { costoUsd, leerConfigLimitesIA, limitePasado, registrarTokensIA, reservarUsoIA } from '../../src/lib/limite-ia';

const config = leerConfigLimitesIA({});

describe('la configuración de los límites', () => {
  it('toma los valores por defecto sin variables, o con valores que no sirven', () => {
    expect(config).toEqual({ pedidosPorHora: 10, topeDiarioUsd: 2, precioEntradaUsd: 1, precioSalidaUsd: 5 });
    expect(leerConfigLimitesIA({ IA_PEDIDOS_POR_HORA: 'mucho', IA_TOPE_DIARIO_USD: '-1', IA_PRECIO_ENTRADA_USD_MTOK: '' })).toEqual(config);
  });

  it('toma las variables de entorno', () => {
    const c = leerConfigLimitesIA({ IA_PEDIDOS_POR_HORA: '3', IA_TOPE_DIARIO_USD: '0.5' });
    expect(c.pedidosPorHora).toBe(3);
    expect(c.topeDiarioUsd).toBe(0.5);
  });
});

describe('el costo y los límites', () => {
  it('calcula el costo con los tokens de la respuesta', () => {
    // Una planilla de 77 jugadores: ~12.000 tokens de salida y ~5.000 de entrada, unos 6 centavos.
    expect(costoUsd({ entrada: 5_000, salida: 11_000 }, config)).toBeCloseTo(0.06, 5);
  });

  it('deja pasar mientras no se llegue a ninguno', () => {
    expect(limitePasado({ pedidosDelUsuario: 9, gastoDeLaOrganizacionUsd: 1.99 }, config)).toBeNull();
  });

  it('frena al llegar al límite de pedidos, aunque no haya gastado nada', () => {
    expect(limitePasado({ pedidosDelUsuario: 10, gastoDeLaOrganizacionUsd: 0 }, config)).toBe('LIMITE_DE_PEDIDOS_IA');
  });

  it('frena al llegar al tope de gasto', () => {
    expect(limitePasado({ pedidosDelUsuario: 1, gastoDeLaOrganizacionUsd: 2 }, config)).toBe('TOPE_DE_GASTO_IA');
  });
});

describe('reservar un pedido', () => {
  const conClave = () => vi.stubEnv('ANTHROPIC_API_KEY', 'clave-de-prueba');
  const uso = (pedidos: number, entrada: number, salida: number) => {
    count.mockResolvedValue(pedidos);
    aggregate.mockResolvedValue({ _sum: { tokensEntrada: entrada, tokensSalida: salida } });
  };

  it('sin clave no cuenta ni limita nada', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    count.mockClear();
    expect(await reservarUsoIA(1, 1, 'IMPORTACION')).toBeNull();
    expect(count).not.toHaveBeenCalled();
    await registrarTokensIA(null, { entrada: 1, salida: 1 });
    expect(update).not.toHaveBeenCalled();
  });

  it('anota el pedido y devuelve su id, y después guarda los tokens', async () => {
    conClave();
    uso(0, 0, 0);
    create.mockResolvedValue({ id: 7 });
    expect(await reservarUsoIA(1, 2, 'RESULTADOS')).toBe(7);
    expect(create).toHaveBeenCalledWith({ data: { organizacionId: 1, usuarioId: 2, funcion: 'RESULTADOS' } });
    await registrarTokensIA(7, { entrada: 100, salida: 50 });
    expect(update).toHaveBeenCalledWith({ where: { id: 7 }, data: { tokensEntrada: 100, tokensSalida: 50 } });
  });

  it('responde 429 si el usuario pasó el límite de pedidos, sin anotar otro', async () => {
    conClave();
    create.mockClear();
    uso(10, 0, 0);
    await expect(reservarUsoIA(1, 2, 'IMPORTACION')).rejects.toMatchObject({ estado: 429, codigo: 'LIMITE_DE_PEDIDOS_IA' });
    expect(create).not.toHaveBeenCalled();
  });

  it('responde 429 si la organización llegó al tope de gasto del día', async () => {
    conClave();
    // 400.000 tokens de salida a US$ 5 por millón: justo el tope de US$ 2.
    uso(1, 0, 400_000);
    const error = await reservarUsoIA(1, 2, 'IMPORTACION').catch((e) => e);
    expect(error).toBeInstanceOf(ErrorHttp);
    expect(error).toMatchObject({ estado: 429, codigo: 'TOPE_DE_GASTO_IA' });
  });
});
