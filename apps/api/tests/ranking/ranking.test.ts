import { describe, expect, it } from 'vitest';
import { asignarPuestos, puntosVigentes, type MovimientoDeRanking } from '../../src/modules/ranking/ranking';

let proximoId = 1;

function movimiento(jugadorId: number, etapaId: number | null, puntos: number, fecha = '2026-01-01'): MovimientoDeRanking {
  return { id: proximoId++, jugadorId, etapaId, puntos, fecha: new Date(fecha) };
}

// Un movimiento por casillero, en el orden Primavera, Verano, Pretemporada, Otoño, Invierno.
function casilleros(jugadorId: number, puntos: number[]) {
  return puntos.map((p, i) => movimiento(jugadorId, i + 1, p));
}

describe('puntosVigentes', () => {
  // Ranking real de Tercera 2026 (02-dominio.md §7.2).
  it('suma los casilleros y da los acumulados del ranking real', () => {
    const puntos = puntosVigentes([
      ...casilleros(1, [10, 15, 50, 15, 75]), // German Fernández
      ...casilleros(2, [15, 10, 10, 50, 25]), // Diego Jacinto
      ...casilleros(3, [0, 0, 100, 0, 0]), // Juan Maffei
    ]);

    expect(puntos.get(1)).toBe(165);
    expect(puntos.get(2)).toBe(110);
    expect(puntos.get(3)).toBe(100);
  });

  it('al volver a jugarse una etapa, sus puntos reemplazan a los del año anterior', () => {
    const puntos = puntosVigentes([
      movimiento(1, 1, 100, '2025-10-01'), // Primavera 25
      movimiento(1, 2, 25, '2026-01-15'), // Verano
      movimiento(1, 1, 15, '2026-10-01'), // Primavera 26
    ]);

    expect(puntos.get(1)).toBe(40);
  });

  it('el reemplazo no depende del orden en que llegan los movimientos', () => {
    const puntos = puntosVigentes([movimiento(1, 1, 15, '2026-10-01'), movimiento(1, 1, 100, '2025-10-01')]);

    expect(puntos.get(1)).toBe(15);
  });

  it('con la misma fecha vale el movimiento cargado después', () => {
    const puntos = puntosVigentes([movimiento(1, 1, 50, '2026-10-01'), movimiento(1, 1, 75, '2026-10-01')]);

    expect(puntos.get(1)).toBe(75);
  });

  it('el casillero de un jugador no pisa el de otro', () => {
    const puntos = puntosVigentes([movimiento(1, 1, 100, '2025-10-01'), movimiento(2, 1, 75, '2026-10-01')]);

    expect(puntos.get(1)).toBe(100);
    expect(puntos.get(2)).toBe(75);
  });

  it('los ajustes manuales no ocupan casillero: se suman todos', () => {
    const puntos = puntosVigentes([movimiento(1, 1, 50), movimiento(1, null, 10), movimiento(1, null, -5)]);

    expect(puntos.get(1)).toBe(55);
  });

  it('un jugador sin movimientos no figura', () => {
    expect(puntosVigentes([]).has(1)).toBe(false);
  });
});

describe('asignarPuestos', () => {
  it('ordena de más a menos puntos', () => {
    const puestos = asignarPuestos(new Map([[1, 110], [2, 165], [3, 100]]));

    expect([puestos.get(2), puestos.get(1), puestos.get(3)]).toEqual([1, 2, 3]);
  });

  it('los empatados comparten puesto y el siguiente saltea los lugares ocupados', () => {
    const puestos = asignarPuestos(new Map([[1, 100], [2, 50], [3, 50], [4, 0]]));

    expect([puestos.get(1), puestos.get(2), puestos.get(3), puestos.get(4)]).toEqual([1, 2, 2, 4]);
  });
});
