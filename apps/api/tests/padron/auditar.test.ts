import { describe, expect, it } from 'vitest';
import { auditar, numerosDeFila } from '../../src/modules/padron/importacion/auditar';
import type { FilaPlanilla } from '../../src/modules/padron/importacion/leer-planilla';
import type { RespuestaImportacion } from '../../src/modules/padron/importacion/schema-respuesta';

type Jugador = RespuestaImportacion['jugadores'][number];

// Planilla chica con la forma de la de POLENTA: título, encabezado, jugadores y una fila de totales.
const FILAS: FilaPlanilla[] = [
  { fila: 1, celdas: ['Ranking Tercera', null, null, null] },
  { fila: 3, celdas: ['Jugador', 'Prim 25', 'Ver 26', 'Total'] },
  { fila: 4, celdas: ['SANHUEZA, Martín', 10, 15, 25] },
  { fila: 5, celdas: ['Diego Antileo', '15', null, '15'] },
  { fila: 6, celdas: ['J. Painemil', '7,5', 50, '57,5'] },
  { fila: 7, celdas: ['Roa Pablo', 0, 25, 25] },
  { fila: 8, celdas: ['Total', 32.5, 90, 122.5] },
];

const PADRON = [1, 2, 3];

function jugador(fila: number, puntos: [number, number], acumulado: number | null, coincideCon: number | null): Jugador {
  return {
    fila,
    nombre: 'Nombre',
    apellido: 'Apellido',
    casilleros: [
      { etapa: 'Primavera', anio: 2025, puntos: puntos[0] },
      { etapa: 'Verano', anio: 2026, puntos: puntos[1] },
    ],
    acumulado,
    coincideCon,
    confianza: coincideCon === null ? null : 'alta',
  };
}

const CORRECTOS = [
  jugador(4, [10, 15], 25, 1),
  jugador(5, [15, 0], 15, 2),
  jugador(6, [7.5, 50], 57.5, 3),
  jugador(7, [0, 25], 25, null),
];

function respuesta(jugadores: Jugador[], esPlanillaDeJugadores = true): RespuestaImportacion {
  return { esPlanillaDeJugadores, motivo: esPlanillaDeJugadores ? null : 'Es otra cosa', jugadores };
}

describe('numerosDeFila', () => {
  it('toma números y textos numéricos, con coma decimal', () => {
    expect(numerosDeFila(['Ana', 10, '15', '7,5', null, '1.5', 'x10'])).toEqual([10, 15, 7.5, 1.5]);
  });
});

describe('auditar', () => {
  it('no encuentra problemas en una respuesta correcta', () => {
    expect(auditar(respuesta(CORRECTOS), FILAS, PADRON)).toEqual({ globales: [], porFila: [] });
  });

  it('acepta un 0 cuando la fila tiene una celda vacía', () => {
    const { porFila } = auditar(respuesta(CORRECTOS), FILAS, PADRON);
    expect(porFila.filter((p) => p.fila === 5)).toEqual([]);
  });

  it('rechaza un 0 si la fila no tiene celdas vacías ni ceros', () => {
    const { porFila } = auditar(respuesta([jugador(4, [10, 0], null, 1), ...CORRECTOS.slice(1)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el 0 de Verano 2026 no está en la planilla' }]);
  });

  it('marca un número inventado', () => {
    const { porFila } = auditar(respuesta([jugador(4, [10, 45], null, 1), ...CORRECTOS.slice(1)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el 45 de Verano 2026 no está en la planilla' }]);
  });

  it('marca un acumulado que no da la suma de los casilleros', () => {
    const { porFila } = auditar(respuesta([jugador(4, [10, 10], 25, 1), ...CORRECTOS.slice(1)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el acumulado es 25 pero los casilleros suman 20' }]);
  });

  it('marca un acumulado que no está en la fila', () => {
    const { porFila } = auditar(respuesta([jugador(4, [10, 15], 30, 1), ...CORRECTOS.slice(1)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el acumulado 30 no está en la planilla' }]);
  });

  it('marca una fila que no existe en la planilla', () => {
    const { porFila } = auditar(respuesta([...CORRECTOS, jugador(40, [10, 15], 25, null)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 40, detalle: 'Fila 40: no existe en la planilla' }]);
  });

  it('marca una fila repetida', () => {
    const { porFila } = auditar(respuesta([...CORRECTOS, CORRECTOS[0]]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: aparece más de una vez' }]);
  });

  it('marca un id que no está en el padrón', () => {
    const { porFila } = auditar(respuesta([jugador(4, [10, 15], 25, 99), ...CORRECTOS.slice(1)]), FILAS, PADRON);
    expect(porFila).toEqual([{ fila: 4, detalle: 'Fila 4: el id 99 no está en el padrón' }]);
  });

  it('da un problema global si faltan jugadores', () => {
    const { globales } = auditar(respuesta(CORRECTOS.slice(0, 1)), FILAS, PADRON);
    expect(globales).toEqual([
      { fila: null, detalle: 'Devolviste 1 jugadores, pero la planilla tiene 5 filas con puntos. Faltan jugadores' },
    ]);
  });

  it('da un problema global si dice que no es de jugadores pero devuelve jugadores', () => {
    const { globales } = auditar(respuesta(CORRECTOS, false), FILAS, PADRON);
    expect(globales).toHaveLength(1);
    expect(globales[0].fila).toBeNull();
  });

  it('no exige jugadores en una planilla que no es de jugadores', () => {
    expect(auditar(respuesta([], false), FILAS, PADRON)).toEqual({ globales: [], porFila: [] });
  });
});
