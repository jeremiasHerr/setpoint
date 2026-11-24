import { describe, expect, it, vi } from 'vitest';

const { count, groupBy, create, update } = vi.hoisted(() => ({ count: vi.fn(), groupBy: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../src/lib/prisma', () => ({ prisma: { usoIA: { count, groupBy, create, update } } }));

import { ErrorHttp } from '../../src/middleware/errores';
import { gastoUsd, leerConfigLimitesIA, limitePasado, registrarTokensIA, reservarUsoIA } from '../../src/lib/limite-ia';

const config = leerConfigLimitesIA({});

describe('la configuración de los límites', () => {
  it('toma los valores por defecto sin variables, o con valores que no sirven', () => {
    expect(config).toEqual({ pedidosPorHora: 10, topeDiarioUsd: 2 });
    expect(leerConfigLimitesIA({ IA_PEDIDOS_POR_HORA: 'mucho', IA_TOPE_DIARIO_USD: '-1' })).toEqual(config);
  });

  it('toma las variables de entorno', () => {
    const c = leerConfigLimitesIA({ IA_PEDIDOS_POR_HORA: '3', IA_TOPE_DIARIO_USD: '0.5' });
    expect(c.pedidosPorHora).toBe(3);
    expect(c.topeDiarioUsd).toBe(0.5);
  });
});

describe('el costo y los límites', () => {
  it('calcula el gasto con los tokens de la respuesta y el precio del modelo de cada funcionalidad', () => {
    // Una planilla de 77 jugadores con Haiku: ~5.000 tokens de entrada y ~11.000 de salida, 6 centavos.
    expect(gastoUsd([{ funcion: 'IMPORTACION', entrada: 5_000, salida: 11_000 }])).toBeCloseTo(0.06, 5);
    // La misma cantidad de tokens leyendo mensajes, con Sonnet, cuesta el doble (decisión 141).
    expect(gastoUsd([{ funcion: 'RESULTADOS', entrada: 5_000, salida: 11_000 }])).toBeCloseTo(0.12, 5);
    expect(
      gastoUsd([
        { funcion: 'IMPORTACION', entrada: 5_000, salida: 11_000 },
        { funcion: 'RESULTADOS', entrada: 5_000, salida: 11_000 },
      ]),
    ).toBeCloseTo(0.18, 5);
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
  const uso = (pedidos: number, entrada: number, salida: number, funcion = 'IMPORTACION') => {
    count.mockResolvedValue(pedidos);
    groupBy.mockResolvedValue([{ funcion, _sum: { tokensEntrada: entrada, tokensSalida: salida } }]);
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

  it('con los mensajes, el tope llega con la mitad de los tokens: Sonnet cuesta US$ 10 por millón de salida', async () => {
    conClave();
    uso(1, 0, 199_000, 'RESULTADOS');
    expect(await reservarUsoIA(1, 2, 'RESULTADOS').catch((e) => e)).not.toBeInstanceOf(ErrorHttp);
    uso(1, 0, 200_000, 'RESULTADOS');
    await expect(reservarUsoIA(1, 2, 'RESULTADOS')).rejects.toMatchObject({ estado: 429, codigo: 'TOPE_DE_GASTO_IA' });
  });
});
