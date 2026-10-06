import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leerPlanilla } from '../src/modules/padron/importacion/leer-planilla';
import { armarMensaje } from '../src/modules/padron/importacion/prompt';

const carpeta = join(__dirname, '../tests/fixtures');

const padron = JSON.parse(readFileSync(join(carpeta, 'padron.json'), 'utf-8'));
const filas = leerPlanilla(readFileSync(join(carpeta, '01-polenta-tercera.xlsx')));

const mensaje = armarMensaje(filas, padron.jugadores, padron.etapas, new Date('2026-10-05'));
console.log(mensaje);
console.log(`\n${mensaje.length} caracteres`);