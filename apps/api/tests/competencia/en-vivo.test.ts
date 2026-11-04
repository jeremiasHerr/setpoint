import { describe, expect, it } from 'vitest';
import { partidosDelCalendario, partidosSinFecha, type PartidoParaElCalendario } from '../../src/modules/competencia/en-vivo';

const partido = (id: number, cambios: Partial<PartidoParaElCalendario> = {}) => ({
  id,
  estado: 'PENDIENTE_COORDINACION' as PartidoParaElCalendario['estado'],
  jugadorAId: 1,
  jugadorBId: 2,
  fechaAcordada: null as Date | null,
  ...cambios,
});

const el = (iso: string) => new Date(iso);

describe('partidosDelCalendario', () => {
  it('lista solo los partidos con fecha, del más próximo al más lejano', () => {
    const partidos = [
      partido(1, { estado: 'ANOTADA', fechaAcordada: el('2026-11-08T18:00:00Z') }),
      partido(2),
      partido(3, { estado: 'CONFIRMADA', fechaAcordada: el('2026-11-06T20:00:00Z') }),
    ];
    expect(partidosDelCalendario(partidos).map((p) => p.id)).toEqual([3, 1]);
  });

  it('deja los jugados con su fecha y saca los cancelados', () => {
    const partidos = [
      partido(1, { estado: 'JUGADA', fechaAcordada: el('2026-11-01T18:00:00Z') }),
      partido(2, { estado: 'CANCELADA', fechaAcordada: el('2026-11-02T18:00:00Z') }),
    ];
    expect(partidosDelCalendario(partidos).map((p) => p.id)).toEqual([1]);
  });

  it('con la misma fecha respeta el orden en que llegaron', () => {
    const misma = '2026-11-06T20:00:00Z';
    const partidos = [partido(5, { fechaAcordada: el(misma) }), partido(4, { fechaAcordada: el(misma) })];
    expect(partidosDelCalendario(partidos).map((p) => p.id)).toEqual([5, 4]);
  });
});

describe('partidosSinFecha', () => {
  it('cuenta los que faltan coordinar, sin los jugados, los cancelados ni los que esperan rival', () => {
    const partidos = [
      partido(1),
      partido(2, { fechaAcordada: el('2026-11-06T20:00:00Z') }),
      partido(3, { estado: 'WALKOVER' }),
      partido(4, { estado: 'CANCELADA' }),
      partido(5, { jugadorBId: null }),
      partido(6),
    ];
    expect(partidosSinFecha(partidos)).toBe(2);
  });
});
