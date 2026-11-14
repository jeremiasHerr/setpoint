import type { FilaExtraida } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import { controlarEntreHojas } from '../../src/modules/padron/importacion/entre-hojas';

function fila(numero: number, nombre: string, apellido: string, coincideCon: number | null = null): FilaExtraida {
  return { fila: numero, nombre, apellido, casilleros: [], acumulado: null, coincideCon, confianza: coincideCon === null ? null : 'alta' };
}

describe('controlarEntreHojas', () => {
  it('sin jugadores repetidos entre hojas, no hay problemas', () => {
    const problemas = controlarEntreHojas([
      { id: 1, categoria: 'Segunda', propuesta: [fila(4, 'Ana', 'Ruiz')] },
      { id: 2, categoria: 'Tercera', propuesta: [fila(4, 'Bruno', 'Sosa')] },
    ]);
    expect(problemas.size).toBe(0);
  });

  it('el mismo jugador nuevo en dos hojas va a revisión en las dos, sin tildes ni mayúsculas', () => {
    const problemas = controlarEntreHojas([
      { id: 1, categoria: 'Segunda', propuesta: [fila(4, 'Martín', 'Sanhueza')] },
      { id: 2, categoria: 'Tercera', propuesta: [fila(7, 'MARTIN', 'SANHUEZA')] },
    ]);
    expect(problemas.get(1)).toEqual([{ fila: 4, detalle: 'Fila 4: también está en Tercera (fila 7). Un jugador va en una sola categoría' }]);
    expect(problemas.get(2)).toEqual([{ fila: 7, detalle: 'Fila 7: también está en Segunda (fila 4). Un jugador va en una sola categoría' }]);
  });

  it('dos filas que coinciden con el mismo jugador del padrón son el mismo, aunque el nombre esté escrito distinto', () => {
    const problemas = controlarEntreHojas([
      { id: 1, categoria: 'Segunda', propuesta: [fila(4, 'J.', 'Painemil', 9)] },
      { id: 2, categoria: 'Tercera', propuesta: [fila(5, 'Juan', 'Painemil', 9)] },
    ]);
    expect([...problemas.keys()]).toEqual([1, 2]);
  });

  it('un nombre repetido dentro de la misma hoja no es asunto de este control', () => {
    const problemas = controlarEntreHojas([{ id: 1, categoria: 'Tercera', propuesta: [fila(4, 'Ana', 'Ruiz'), fila(5, 'Ana', 'Ruiz')] }]);
    expect(problemas.size).toBe(0);
  });
});
