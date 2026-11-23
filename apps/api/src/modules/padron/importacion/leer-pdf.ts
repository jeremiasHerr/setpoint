// Un PDF con texto, como el ranking exportado de Excel, convertido en las mismas filas que una
// planilla (decisión 137). Con el texto y su posición se rearma la tabla: cada renglón es una fila, y
// cada número va a su columna, así una celda vacía queda vacía y no corre los números de al lado.
// Un PDF escaneado no tiene texto: se rechaza, porque no hay contra qué auditar.
import { getDocumentProxy } from 'unpdf';
import type { Celda, FilaPlanilla } from './leer-planilla';

// Un pedazo de texto con su caja: x0 y x1 en horizontal, y la línea de base en vertical.
export type Trozo = { texto: string; x0: number; x1: number; y: number; pagina: number };

type Intervalo = { x0: number; x1: number };

// Dos textos del mismo renglón a menos de esto están en la misma celda: pdf.js ya entrega cada celda
// de Excel como un solo trozo, y solo corta una palabra al cambiar de fuente. En el ranking de POLENTA
// dos encabezados quedan a 3,5 pt, así que el margen es chico.
const SEPARACION_DE_CELDA = 1.5;
// Dos trozos a menos de esto en vertical están en el mismo renglón.
const TOLERANCIA_DE_RENGLON = 3;

const NUMERO = /^-?\d+([.,]\d+)?$/;

export class PdfSinTexto extends Error {
  constructor() {
    super('El PDF no tiene texto');
  }
}

async function trozosDelPdf(archivo: Buffer): Promise<Trozo[]> {
  const pdf = await getDocumentProxy(new Uint8Array(archivo));
  const trozos: Trozo[] = [];
  try {
    for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
      const { items } = await (await pdf.getPage(pagina)).getTextContent();
      for (const item of items) {
        if (!('str' in item) || item.str.trim() === '') continue;
        const [, , , , x, y] = item.transform as number[];
        trozos.push({ texto: item.str.trim(), x0: x, x1: x + item.width, y, pagina });
      }
    }
  } finally {
    // Sin esto, el documento queda abierto y retiene memoria después de cada subida.
    await pdf.loadingTask.destroy();
  }
  return trozos;
}

// Los renglones de arriba hacia abajo, página por página, cada uno con sus celdas de izquierda a
// derecha.
function renglones(trozos: Trozo[]): Trozo[][] {
  const ordenados = [...trozos].sort((a, b) => a.pagina - b.pagina || b.y - a.y || a.x0 - b.x0);
  const lineas: Trozo[][] = [];
  for (const trozo of ordenados) {
    const actual = lineas.at(-1);
    if (actual && actual[0].pagina === trozo.pagina && Math.abs(actual[0].y - trozo.y) <= TOLERANCIA_DE_RENGLON) actual.push(trozo);
    else lineas.push([trozo]);
  }
  return lineas.map((linea) => linea.sort((a, b) => a.x0 - b.x0));
}

// Las columnas de números: los lugares horizontales donde hay números, unidos si se pisan. Los nombres
// no se usan, porque su ancho varía y uniría columnas distintas. Una columna con un solo número cuenta
// igual: puede ser el único jugador con puntos en ese torneo. Si sale de un "25" suelto de un
// encabezado, solo agrega una celda vacía a cada renglón.
function columnasDeNumeros(lineas: Trozo[][]): Intervalo[] {
  const numeros = lineas.flat().filter((t) => NUMERO.test(t.texto)).sort((a, b) => a.x0 - b.x0);
  const columnas: Intervalo[] = [];
  for (const { x0, x1 } of numeros) {
    const ultima = columnas.at(-1);
    if (ultima && x0 <= ultima.x1) ultima.x1 = Math.max(ultima.x1, x1);
    else columnas.push({ x0, x1 });
  }
  return columnas;
}

// La columna en la que cae un número: la que pisa. -1 si no pisa ninguna.
const columnaDe = (trozo: Trozo, columnas: Intervalo[]) =>
  columnas.findIndex((c) => trozo.x0 <= c.x1 && trozo.x1 >= c.x0);

type CeldaUbicada = { x: number; columna: number; texto: string; x1: number };

// Arma las filas a partir de los trozos de texto. Separado de la lectura del PDF para probarlo sin un
// archivo. Cada número va a su columna, y en los renglones con algún número cada columna lleva su
// celda, vacía si no hay nada. Los textos van en el orden en que aparecen, sin columna: en un PDF
// exportado de Excel se desbordan sobre la celda de al lado (un nombre largo, un encabezado), y
// ubicarlos por columna los mezclaría con los números. Dos textos separados por un espacio son una
// celda ("German" "Fernández"); si se pisan, son dos celdas que se desbordaron.
export function filasDeTrozos(trozos: Trozo[]): FilaPlanilla[] {
  const lineas = renglones(trozos);
  const columnas = columnasDeNumeros(lineas);

  return lineas.map((linea, i) => {
    const celdas: CeldaUbicada[] = [];
    const ocupadas = new Set<number>();
    for (const trozo of linea) {
      const columna = NUMERO.test(trozo.texto) ? columnaDe(trozo, columnas) : -1;
      if (columna >= 0 && !ocupadas.has(columna)) {
        ocupadas.add(columna);
        celdas.push({ x: columnas[columna].x0, columna, texto: trozo.texto, x1: trozo.x1 });
        continue;
      }
      const ultima = celdas.at(-1);
      const separacion = ultima ? trozo.x0 - ultima.x1 : -1;
      if (ultima && ultima.columna === -1 && !NUMERO.test(ultima.texto) && !NUMERO.test(trozo.texto) && separacion >= 0 && separacion < SEPARACION_DE_CELDA) {
        ultima.texto = `${ultima.texto} ${trozo.texto}`;
        ultima.x1 = trozo.x1;
      } else {
        celdas.push({ x: trozo.x0, columna: -1, texto: trozo.texto, x1: trozo.x1 });
      }
    }
    // Las columnas vacías, solo en los renglones con números: un título no las necesita.
    if (linea.some((t) => NUMERO.test(t.texto))) {
      columnas.forEach((c, j) => {
        if (!ocupadas.has(j)) celdas.push({ x: c.x0, columna: j, texto: '', x1: c.x1 });
      });
    }
    return {
      fila: i + 1,
      celdas: celdas.sort((a, b) => a.x - b.x).map((c) => (c.texto === '' ? null : comoCelda(c.texto))),
    };
  });
}

function comoCelda(texto: string): Celda {
  return NUMERO.test(texto) ? Number(texto.replace(',', '.')) : texto;
}

export async function leerPdf(archivo: Buffer): Promise<FilaPlanilla[]> {
  const trozos = await trozosDelPdf(archivo);
  if (trozos.length === 0) throw new PdfSinTexto();
  return filasDeTrozos(trozos);
}
