import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extraerConIA, type ResultadoExtraccion } from '../../src/modules/padron/importacion/extraer-con-ia';
import { procesarPlanilla } from '../../src/modules/padron/importacion/procesar-planilla';

// Sin llamadas reales: cada test define qué devuelve la IA en cada intento.
vi.mock('../../src/modules/padron/importacion/extraer-con-ia', () => ({
  MODELO: 'modelo-de-prueba',
  extraerConIA: vi.fn(),
}));
const extraer = vi.mocked(extraerConIA);

const FIXTURES = join(__dirname, '../fixtures');
const ARCHIVO = readFileSync(join(FIXTURES, '01-polenta-tercera.xlsx'));
const PADRON = JSON.parse(readFileSync(join(FIXTURES, 'padron.json'), 'utf-8'));
const ESPERADO = JSON.parse(readFileSync(join(FIXTURES, '01-polenta-tercera.esperado.json'), 'utf-8'));
const CONTEXTO = { padron: PADRON.jugadores, etapas: PADRON.etapas, hoy: new Date('2026-10-05') };

const TOKENS = { entrada: 1000, salida: 500 };

function correcta(jugadores = ESPERADO.jugadores): ResultadoExtraccion {
  const respuesta = {
    esPlanillaDeJugadores: true,
    motivo: null,
    jugadores: jugadores.map((j: object) => ({ ...j, confianza: 'alta' })),
  };
  return { ok: true, respuesta, crudo: JSON.stringify(respuesta), tokens: TOKENS };
}

// Con llaves: si beforeEach devuelve una función, Vitest la ejecuta como limpieza.
beforeEach(() => {
  extraer.mockReset();
});

describe('procesarPlanilla', () => {
  it('con una respuesta correcta hace un solo intento', async () => {
    extraer.mockResolvedValueOnce(correcta());
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(true);
    expect(resultado.intentos).toBe(1);
    expect(resultado.tokens).toEqual(TOKENS);
    expect(resultado.modelo).toBe('modelo-de-prueba');
    expect(resultado.versionPrompt).toBe('importacion-v1');
  });

  it('si falla la extracción reintenta con el error y suma los tokens', async () => {
    extraer
      .mockResolvedValueOnce({ ok: false, error: 'La respuesta no es JSON válido', crudo: '{', tokens: TOKENS })
      .mockResolvedValueOnce(correcta());
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(true);
    expect(resultado.intentos).toBe(2);
    expect(resultado.tokens).toEqual({ entrada: 2000, salida: 1000 });
    expect(resultado.crudos).toHaveLength(2);
    expect(extraer.mock.calls[1][0]).toContain('Tu respuesta anterior tuvo estos problemas:\n- La respuesta no es JSON válido');
  });

  it('si faltan jugadores reintenta con el problema global', async () => {
    extraer.mockResolvedValueOnce(correcta(ESPERADO.jugadores.slice(0, 5))).mockResolvedValueOnce(correcta());
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(true);
    expect(resultado.intentos).toBe(2);
    expect(extraer.mock.calls[1][0]).toContain('Faltan jugadores');
  });

  it('un error de la API cuenta como intento fallido sin romper', async () => {
    extraer.mockImplementation(async () => {
      throw new Error('Connection error');
    });
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(false);
    expect(resultado.intentos).toBe(2);
    if (!resultado.ok) expect(resultado.error).toContain('Connection error');
  });

  it('si el segundo intento también tiene problemas globales devuelve error', async () => {
    extraer.mockResolvedValue(correcta(ESPERADO.jugadores.slice(0, 5)));
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(false);
    expect(resultado.intentos).toBe(2);
    expect(resultado.auditoria?.globales).toHaveLength(1);
  });

  it('los problemas por fila no se reintentan', async () => {
    const [primero, ...resto] = ESPERADO.jugadores;
    extraer.mockResolvedValueOnce(correcta([{ ...primero, acumulado: 999 }, ...resto]));
    const resultado = await procesarPlanilla(ARCHIVO, CONTEXTO);

    expect(resultado.ok).toBe(true);
    expect(resultado.intentos).toBe(1);
    expect(resultado.auditoria?.porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el acumulado 999 no está en la planilla' }]);
  });
});
