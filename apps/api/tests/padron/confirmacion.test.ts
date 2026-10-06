import type { FilaPropuesta } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import { ErrorHttp } from '../../src/middleware/errores';
import {
  contarFilas,
  fechaDelCasillero,
  planificarConfirmacion,
  yaExiste,
} from '../../src/modules/padron/importacion/confirmacion';

function fila(numero: number, coincideCon: number | null, confianza: FilaPropuesta['confianza'], puntos = [10, 0]): FilaPropuesta {
  return {
    fila: numero,
    nombre: 'Nombre',
    apellido: `Apellido ${numero}`,
    casilleros: [
      { etapa: 'Primavera', anio: 2025, puntos: puntos[0] },
      { etapa: 'Verano', anio: 2026, puntos: puntos[1] },
    ],
    acumulado: null,
    coincideCon,
    confianza,
  };
}

const PROPUESTA = [fila(4, 1, 'alta'), fila(5, 2, 'media'), fila(6, null, null), fila(7, 3, 'alta')];
const JUGADORES = new Set([1, 2, 3, 9]);
const ETAPAS = new Map([
  ['Primavera', 11],
  ['Verano', 12],
]);

function camposDelError(accion: () => unknown) {
  try {
    accion();
  } catch (err) {
    if (err instanceof ErrorHttp) return err.campos;
  }
  throw new Error('No tiró ErrorHttp');
}

describe('contarFilas', () => {
  it('separa existentes, dudosos, nuevos y con problemas sin contar dos veces', () => {
    expect(contarFilas(PROPUESTA, [{ fila: 7, detalle: 'x' }, { fila: 7, detalle: 'y' }])).toEqual({
      existentes: 1,
      dudosos: 1,
      nuevos: 1,
      conProblemas: 1,
    });
  });
});

describe('fechaDelCasillero', () => {
  it('es el 1° de enero del año, en UTC', () => {
    expect(fechaDelCasillero(2026).toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('planificarConfirmacion', () => {
  const decisiones = [
    { fila: 4, accion: 'vincular' as const, jugadorId: 1 },
    { fila: 5, accion: 'vincular' as const, jugadorId: 9 },
    { fila: 6, accion: 'crear' as const },
    { fila: 7, accion: 'excluir' as const },
  ];

  it('arma las altas, las vinculaciones y un movimiento por casillero con puntos', () => {
    const plan = planificarConfirmacion(PROPUESTA, decisiones, JUGADORES, ETAPAS);

    expect(plan.excluidos).toBe(1);
    expect(plan.crear).toEqual([
      {
        nombre: 'Nombre',
        apellido: 'Apellido 6',
        movimientos: [{ etapaId: 11, puntos: 10, fecha: new Date('2025-01-01'), detalle: 'Planilla: Primavera 2025' }],
      },
    ]);
    expect(plan.vincular.map((v) => v.jugadorId)).toEqual([1, 9]);
  });

  it('exige una decisión por cada fila', () => {
    expect(camposDelError(() => planificarConfirmacion(PROPUESTA, decisiones.slice(0, 3), JUGADORES, ETAPAS))).toEqual({
      'fila.7': 'Falta decidir qué hacer con esta fila',
    });
  });

  it('rechaza filas que no están en la importación y decisiones repetidas', () => {
    const campos = camposDelError(() =>
      planificarConfirmacion(PROPUESTA, [...decisiones, decisiones[3], { fila: 40, accion: 'crear' }], JUGADORES, ETAPAS),
    );
    expect(campos).toEqual({
      'fila.7': 'Hay más de una decisión para esta fila',
      'fila.40': 'La fila no está en la importación',
    });
  });

  it('rechaza vincular a un jugador de otra organización o a uno ya vinculado', () => {
    const campos = camposDelError(() =>
      planificarConfirmacion(
        PROPUESTA,
        [
          { fila: 4, accion: 'vincular', jugadorId: 1 },
          { fila: 5, accion: 'vincular', jugadorId: 1 },
          { fila: 6, accion: 'vincular', jugadorId: 500 },
          { fila: 7, accion: 'excluir' },
        ],
        JUGADORES,
        ETAPAS,
      ),
    );
    expect(campos).toEqual({
      'fila.5': 'Ese jugador ya está vinculado a otra fila',
      'fila.6': 'El jugador no está en el padrón',
    });
  });
});

describe('yaExiste', () => {
  const movimiento = { etapaId: 11, puntos: 10, fecha: new Date('2025-01-01'), detalle: '' };

  it('encuentra el mismo casillero del mismo año con los mismos puntos', () => {
    expect(yaExiste(movimiento, [{ etapaId: 11, puntos: 10, fecha: new Date('2025-10-20') }])).toBe(true);
  });

  it('no confunde otro año, otra etapa u otros puntos', () => {
    expect(
      yaExiste(movimiento, [
        { etapaId: 11, puntos: 10, fecha: new Date('2026-01-01') },
        { etapaId: 12, puntos: 10, fecha: new Date('2025-01-01') },
        { etapaId: 11, puntos: 15, fecha: new Date('2025-01-01') },
      ]),
    ).toBe(false);
  });
});
