import { describe, expect, it } from 'vitest';
import {
  diasHasta,
  plazoQueCorre,
  porUrgencia,
  situacionDelPartido,
  type PartidoParaElTablero,
} from '../../src/modules/competencia/tablero';

const HOY = '2026-10-30';
// Las fechas límite se guardan como la medianoche UTC del último día.
const limite = (dia: string) => new Date(`${dia}T00:00:00.000Z`);

const partido = (cambios: Partial<PartidoParaElTablero> = {}): PartidoParaElTablero => ({
  estado: 'PENDIENTE_COORDINACION',
  jugadorAId: 1,
  jugadorBId: 2,
  fechaLimite: limite('2026-11-05'),
  fechaAcordada: null,
  ...cambios,
});

describe('diasHasta', () => {
  it('cuenta los días hasta la fecha límite: 0 si vence hoy, negativo si ya venció', () => {
    expect(diasHasta(limite('2026-11-05'), HOY)).toBe(6);
    expect(diasHasta(limite(HOY), HOY)).toBe(0);
    expect(diasHasta(limite('2026-10-29'), HOY)).toBe(-1);
  });

  it('no se corre con el cambio de mes', () => {
    expect(diasHasta(limite('2026-11-01'), HOY)).toBe(2);
  });
});

describe('situacionDelPartido', () => {
  it('con resultado está jugado, aunque haya vencido: W.O. y abandono también', () => {
    for (const estado of ['JUGADA', 'WALKOVER', 'ABANDONO'] as const) {
      expect(situacionDelPartido(partido({ estado, fechaLimite: limite('2026-10-01') }), HOY)).toBe('jugado');
    }
  });

  it('sin resultado y con la fecha límite pasada, está vencido (decisión 060)', () => {
    expect(situacionDelPartido(partido({ fechaLimite: limite('2026-10-29') }), HOY)).toBe('vencido');
  });

  it('el día de la fecha límite todavía no venció', () => {
    expect(situacionDelPartido(partido({ fechaLimite: limite(HOY) }), HOY)).toBe('sin_coordinar');
  });

  it('una fecha acordada que no se jugó a tiempo también vence', () => {
    const acordado = partido({ estado: 'CONFIRMADA', fechaAcordada: new Date('2026-10-20T18:00:00Z'), fechaLimite: limite('2026-10-25') });
    expect(situacionDelPartido(acordado, HOY)).toBe('vencido');
  });

  it('con fecha anotada o confirmada, y dentro del plazo, tiene fecha', () => {
    expect(situacionDelPartido(partido({ estado: 'ANOTADA' }), HOY)).toBe('con_fecha');
    expect(situacionDelPartido(partido({ fechaAcordada: new Date('2026-11-02T18:00:00Z') }), HOY)).toBe('con_fecha');
  });

  it('un partido de cuadro sin sus dos jugadores está esperando, aunque haya pasado su plazo', () => {
    expect(situacionDelPartido(partido({ jugadorBId: null, fechaLimite: limite('2026-10-01') }), HOY)).toBe('esperando');
  });

  it('sin fecha límite nunca vence', () => {
    expect(situacionDelPartido(partido({ fechaLimite: null }), HOY)).toBe('sin_coordinar');
  });
});

describe('plazoQueCorre', () => {
  it('es la fecha límite más cercana de lo que todavía se puede jugar', () => {
    const plazo = plazoQueCorre(
      [
        partido({ fechaLimite: limite('2026-11-12') }),
        partido({ fechaLimite: limite('2026-11-05') }),
        // Los jugados y los que esperan jugadores no cuentan.
        partido({ estado: 'JUGADA', fechaLimite: limite('2026-11-01') }),
        partido({ jugadorAId: null, fechaLimite: limite('2026-11-02') }),
      ],
      HOY,
    );
    expect(plazo).toEqual({ fechaLimite: '2026-11-05', dias: 6 });
  });

  it('con un vencido, el plazo ya pasó', () => {
    expect(plazoQueCorre([partido({ fechaLimite: limite('2026-10-27') })], HOY)).toEqual({ fechaLimite: '2026-10-27', dias: -3 });
  });

  it('sin nada pendiente, o sin fechas límite, no hay plazo', () => {
    expect(plazoQueCorre([partido({ estado: 'JUGADA' })], HOY)).toBeNull();
    expect(plazoQueCorre([partido({ fechaLimite: null })], HOY)).toBeNull();
  });
});

describe('porUrgencia', () => {
  it('va del plazo más viejo al más nuevo, y los que no tienen plazo al final', () => {
    const ordenados = porUrgencia([
      { id: 1, dias: 6 },
      { id: 2, dias: null },
      { id: 3, dias: -3 },
      { id: 4, dias: -1 },
    ]);
    expect(ordenados.map((p) => p.id)).toEqual([3, 4, 1, 2]);
  });

  it('con el mismo plazo, respeta el orden en que llegaron', () => {
    const ordenados = porUrgencia([
      { id: 1, dias: 6 },
      { id: 2, dias: 6 },
      { id: 3, dias: 6 },
    ]);
    expect(ordenados.map((p) => p.id)).toEqual([1, 2, 3]);
  });
});
