import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leerPlanilla } from '../src/modules/padron/importacion/leer-planilla';

const carpeta = join(__dirname, '../tests/fixtures');

const planillas = [
  '01-polenta-tercera',
  '02-columnas-en-otro-orden',
  '03-con-totales-y-notas',
  '04-nombres-distintos',
  '05-no-es-de-jugadores',
];

for (const nombre of planillas) {
  const archivo = readFileSync(join(carpeta, `${nombre}.xlsx`));
  const filas = leerPlanilla(archivo);

  console.log(`\n${nombre}: ${filas.length} filas`);
  console.table(filas.slice(0, 5).map((f) => ({ fila: f.fila, ...f.celdas })));
}