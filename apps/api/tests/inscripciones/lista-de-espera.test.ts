import { describe, expect, it } from 'vitest';
import {
  aQuienesLesToca,
  lugaresLibres,
  seAsignanLugares,
  sePuedeModificar,
  venceLaReserva,
} from '../../src/modules/inscripciones/lista-de-espera';

const dia = (n: number) => new Date(`2026-09-${String(n).padStart(2, '0')}T12:00:00Z`);

describe('sePuedeModificar', () => {
  it('con la inscripción abierta o cerrada, hasta que se confirma el sorteo (decisión 077)', () => {
    expect(sePuedeModificar({ estado: 'PUBLICADO', sorteoConfirmado: false })).toBe(true);
    expect(sePuedeModificar({ estado: 'INSCRIPCIONES_CERRADAS', sorteoConfirmado: false })).toBe(true);
    expect(sePuedeModificar({ estado: 'INSCRIPCIONES_CERRADAS', sorteoConfirmado: true })).toBe(false);
    expect(sePuedeModificar({ estado: 'GRUPOS_EN_CURSO', sorteoConfirmado: true })).toBe(false);
    expect(sePuedeModificar({ estado: 'BORRADOR', sorteoConfirmado: false })).toBe(false);
  });
});

describe('seAsignanLugares', () => {
  it('solo si el torneo tiene lista de espera y todavía se puede modificar', () => {
    expect(seAsignanLugares({ estado: 'PUBLICADO', sorteoConfirmado: false, tieneListaEspera: true })).toBe(true);
    expect(seAsignanLugares({ estado: 'PUBLICADO', sorteoConfirmado: false, tieneListaEspera: false })).toBe(false);
    expect(seAsignanLugares({ estado: 'INSCRIPCIONES_CERRADAS', sorteoConfirmado: true, tieneListaEspera: true })).toBe(false);
  });
});

describe('lugaresLibres', () => {
  it('nunca es negativo, aunque un pago tardío pase el cupo', () => {
    expect(lugaresLibres(32, 30)).toBe(2);
    expect(lugaresLibres(32, 33)).toBe(0);
  });
});

describe('aQuienesLesToca', () => {
  const ojeda = { id: 10, ordenListaEspera: 1, creadoEn: dia(19) };
  const rivas = { id: 11, ordenListaEspera: 2, creadoEn: dia(19) };
  const lagos = { id: 12, ordenListaEspera: 3, creadoEn: dia(20) };

  it('los primeros por orden de llegada, tantos como lugares libres', () => {
    expect(aQuienesLesToca([lagos, ojeda, rivas], 1)).toEqual([ojeda]);
    expect(aQuienesLesToca([lagos, ojeda, rivas], 2)).toEqual([ojeda, rivas]);
  });

  it('sin lugares libres, a nadie; con más lugares que gente, a todos', () => {
    expect(aQuienesLesToca([ojeda, rivas], 0)).toEqual([]);
    expect(aQuienesLesToca([ojeda, rivas], 5)).toEqual([ojeda, rivas]);
  });

  it('con el mismo número, el que se anotó antes', () => {
    const antes = { id: 20, ordenListaEspera: 4, creadoEn: dia(18) };
    const despues = { id: 21, ordenListaEspera: 4, creadoEn: dia(21) };
    expect(aQuienesLesToca([despues, antes], 1)).toEqual([antes]);
  });
});

describe('venceLaReserva', () => {
  it('las horas del torneo desde el aviso (decisión 076)', () => {
    expect(venceLaReserva(new Date('2026-09-19T18:40:00Z'), 24)).toEqual(new Date('2026-09-20T18:40:00Z'));
  });
});
