import { describe, expect, it } from 'vitest';
import { calcularFormato, type DatosFormato } from '@setpoint/shared';

const polenta: DatosFormato = {
  cantidadGrupos: 8,
  clasificanPorGrupo: 2,
  tieneComplementaria: true,
  plazoGruposDias: 21,
  plazoPorRondaDias: 7,
  fechaInicio: '2026-10-06',
};

describe('calcularFormato', () => {
  it('da los números de POLENTA de la pantalla de referencia', () => {
    const formato = calcularFormato(polenta);

    expect(formato).toMatchObject({
      partidosZona: 48,
      partidosCampeonato: 15,
      partidosComplementaria: 15,
      partidosTotal: 78,
      rondas: 4,
      duracionDias: 49,
      minimoPartidosPorJugador: 4,
      fechaFin: '2026-11-23',
    });
    expect(formato.cronograma).toEqual([
      { nombre: 'grupos', dias: 21, desde: '2026-10-06', hasta: '2026-10-26' },
      { nombre: 'octavos', dias: 7, desde: '2026-10-27', hasta: '2026-11-02' },
      { nombre: 'cuartos', dias: 7, desde: '2026-11-03', hasta: '2026-11-09' },
      { nombre: 'semis', dias: 7, desde: '2026-11-10', hasta: '2026-11-16' },
      { nombre: 'final', dias: 7, desde: '2026-11-17', hasta: '2026-11-23' },
    ]);
  });

  it('sin Complementaria, los que no clasifican juegan solo los 3 de zona', () => {
    const formato = calcularFormato({ ...polenta, tieneComplementaria: false });

    expect(formato).toMatchObject({
      jugadoresComplementaria: 0,
      partidosComplementaria: 0,
      partidosTotal: 63,
      rondas: 4,
      minimoPartidosPorJugador: 3,
    });
  });

  it('con 3 clasificados, Campeonato es más grande y marca las rondas', () => {
    const formato = calcularFormato({ ...polenta, clasificanPorGrupo: 3 });

    expect(formato).toMatchObject({
      jugadoresCampeonato: 24,
      jugadoresComplementaria: 8,
      partidosCampeonato: 23,
      partidosComplementaria: 7,
      rondas: 5,
      duracionDias: 56,
    });
    expect(formato.cronograma.map((i) => i.nombre)).toEqual([
      'grupos',
      'dieciseisavos',
      'octavos',
      'cuartos',
      'semis',
      'final',
    ]);
  });

  it('con un cuadro que no es potencia de 2 hay byes, pero sigue siendo n − 1 partidos', () => {
    const formato = calcularFormato({ ...polenta, cantidadGrupos: 6 });

    expect(formato).toMatchObject({
      jugadoresCampeonato: 12,
      partidosZona: 36,
      partidosCampeonato: 11,
      partidosComplementaria: 11,
      partidosTotal: 58,
      rondas: 4,
    });
  });

  it('sin fecha de inicio da los días pero no las fechas', () => {
    const formato = calcularFormato({ ...polenta, fechaInicio: null });

    expect(formato.duracionDias).toBe(49);
    expect(formato.fechaFin).toBeNull();
    expect(formato.cronograma[0]).toEqual({ nombre: 'grupos', dias: 21, desde: null, hasta: null });
  });

  it('con un solo grupo y un clasificado no hay cuadro: el campeón sale de la zona', () => {
    const formato = calcularFormato({ ...polenta, cantidadGrupos: 1, clasificanPorGrupo: 1, tieneComplementaria: false });

    expect(formato).toMatchObject({ partidosTotal: 6, rondas: 0, duracionDias: 21, minimoPartidosPorJugador: 3 });
    expect(formato.cronograma).toHaveLength(1);
  });
});
