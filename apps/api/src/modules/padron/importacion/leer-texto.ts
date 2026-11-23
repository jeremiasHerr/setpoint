// Un ranking pegado como texto (copiado de WhatsApp o de una planilla), convertido en las mismas
// filas que una planilla (decisión 140). Cada línea es una fila, con su número de línea, y se audita
// igual: cada número tiene que estar en su línea.
import type { Celda, FilaPlanilla } from './leer-planilla';

const NUMERO = /^-?\d+([.,]\d+)?$/;

const comoCelda = (texto: string): Celda => {
  const limpio = texto.trim();
  if (limpio === '') return null;
  return NUMERO.test(limpio) ? Number(limpio.replace(',', '.')) : limpio;
};

// Las celdas de una línea. Copiado de una planilla viene con tabulaciones, que conservan las celdas
// vacías; si no, se separa por "|" o por dos espacios o más. Escrito a mano ("German Fernández 10 15
// 165"), cada número es una celda y las palabras seguidas son una sola.
export function celdasDeLinea(linea: string): Celda[] {
  if (linea.trim() === '') return [];
  if (linea.includes('\t')) return linea.split('\t').map(comoCelda);
  // Los bordes de una tabla ("| a | b |") no son celdas.
  if (linea.includes('|')) return linea.trim().replace(/^\||\|$/g, '').split('|').map(comoCelda);
  const porEspacios = linea.trim().split(/\s{2,}/);
  if (porEspacios.length > 1) return porEspacios.map(comoCelda);

  const celdas: Celda[] = [];
  let palabras: string[] = [];
  for (const parte of linea.trim().split(/\s+/)) {
    if (NUMERO.test(parte)) {
      if (palabras.length > 0) celdas.push(palabras.join(' '));
      palabras = [];
      celdas.push(comoCelda(parte));
    } else {
      palabras.push(parte);
    }
  }
  if (palabras.length > 0) celdas.push(palabras.join(' '));
  return celdas;
}

// Las líneas vacías no se devuelven, pero cuentan para el número de fila: así coincide con la línea
// que ve la persona.
export function leerTexto(texto: string): FilaPlanilla[] {
  return texto
    .split(/\r?\n/)
    .map((linea, i) => ({ fila: i + 1, celdas: celdasDeLinea(linea) }))
    .filter((f) => f.celdas.some((c) => c !== null));
}
