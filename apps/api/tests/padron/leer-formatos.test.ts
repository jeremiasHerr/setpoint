// Los lectores de PDF y de texto pegado (decisión 140): convierten la fuente en las mismas filas que
// una planilla, para que la auditoría las trate igual.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { filasDeTrozos, leerPdf, type Trozo } from '../../src/modules/padron/importacion/leer-pdf';
import { leerHoja } from '../../src/modules/padron/importacion/leer-planilla';
import { celdasDeLinea, leerTexto } from '../../src/modules/padron/importacion/leer-texto';

const FIXTURES = join(__dirname, '../fixtures');

describe('leerTexto', () => {
  it('numera las líneas como las ve la persona, aunque haya líneas vacías', () => {
    const filas = leerTexto('Ranking Tercera\n\nAna Pérez 10 15 25\r\n');
    expect(filas).toEqual([
      { fila: 1, celdas: ['Ranking Tercera'] },
      { fila: 3, celdas: ['Ana Pérez', 10, 15, 25] },
    ]);
  });

  it('copiado de una planilla, conserva las celdas vacías de las tabulaciones', () => {
    expect(celdasDeLinea('Ana Pérez\t10\t\t25')).toEqual(['Ana Pérez', 10, null, 25]);
  });

  it('separa por "|" sin los bordes de la tabla', () => {
    expect(celdasDeLinea('| Ana Pérez | 10 |  | 25 |')).toEqual(['Ana Pérez', 10, null, 25]);
  });

  it('separa por dos espacios o más', () => {
    expect(celdasDeLinea('PÉREZ, Ana   10   7,5')).toEqual(['PÉREZ, Ana', 10, 7.5]);
  });

  it('escrito a mano, cada número es una celda y las palabras seguidas una sola', () => {
    expect(celdasDeLinea('1. Ana Pérez 10 15 25')).toEqual(['1. Ana Pérez', 10, 15, 25]);
  });
});

// Trozos de un renglón: [texto, x0, x1], todos en la misma altura.
const renglon = (y: number, trozos: [string, number, number][]): Trozo[] =>
  trozos.map(([texto, x0, x1]) => ({ texto, x0, x1, y, pagina: 1 }));

describe('filasDeTrozos', () => {
  it('deja vacía la celda de una columna sin número, sin correr los de al lado', () => {
    const filas = filasDeTrozos([
      ...renglon(700, [['Ranking', 50, 90]]),
      ...renglon(680, [['Jugador', 50, 90], ['Prim 25', 100, 140], ['Ver 26', 150, 190], ['Total', 200, 230]]),
      ...renglon(660, [['Ana Pérez', 50, 95], ['10', 128, 140], ['15', 178, 190], ['25', 218, 230]]),
      ...renglon(640, [['Eva Ruiz', 50, 90], ['20', 178, 190], ['20', 218, 230]]),
    ]);
    expect(filas).toEqual([
      { fila: 1, celdas: ['Ranking'] },
      { fila: 2, celdas: ['Jugador', 'Prim 25', 'Ver 26', 'Total'] },
      { fila: 3, celdas: ['Ana Pérez', 10, 15, 25] },
      { fila: 4, celdas: ['Eva Ruiz', null, 20, 20] },
    ]);
  });

  it('no mezcla un nombre largo que se desborda sobre la columna de al lado', () => {
    const filas = filasDeTrozos([
      ...renglon(660, [['CURRUHUINCA, Damián', 50, 131], ['10', 128, 140], ['25', 218, 230]]),
      ...renglon(640, [['Eva Ruiz', 50, 90], ['20', 128, 140], ['20', 218, 230]]),
    ]);
    expect(filas[0].celdas).toEqual(['CURRUHUINCA, Damián', 10, 25]);
  });

  it('une los trozos de una misma celda y separa los que se pisan', () => {
    const filas = filasDeTrozos(renglon(700, [['Ana', 50, 65], ['Pérez', 66, 90], ['OTOÑO 26', 100, 140], ['INVIERNO 26', 130, 180]]));
    expect(filas[0].celdas).toEqual(['Ana Pérez', 'OTOÑO 26', 'INVIERNO 26']);
  });

  it('sigue en la página siguiente con la numeración corrida', () => {
    const filas = filasDeTrozos([
      { texto: 'Ana', x0: 50, x1: 70, y: 100, pagina: 1 },
      { texto: 'Eva', x0: 50, x1: 70, y: 700, pagina: 2 },
    ]);
    expect(filas.map((f) => [f.fila, f.celdas[0]])).toEqual([[1, 'Ana'], [2, 'Eva']]);
  });
});

describe('leerPdf', () => {
  // El ranking de Tercera exportado a PDF desde Excel: las mismas celdas que la planilla.
  it('lee el PDF exportado de Excel con las mismas celdas que la planilla', async () => {
    const pdf = await leerPdf(readFileSync(join(FIXTURES, '08-pdf-exportado.pdf')));
    const planilla = leerHoja(readFileSync(join(FIXTURES, '01-polenta-tercera.xlsx'))).filas;
    const sinVacias = (celdas: unknown[]) => celdas.filter((c) => c !== null);
    expect(pdf.map((f) => sinVacias(f.celdas))).toEqual(planilla.map((f) => sinVacias(f.celdas)));
  });
});
