import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leerHoja } from '../src/modules/padron/importacion/leer-planilla';
import { armarMensaje } from '../src/modules/padron/importacion/prompt';

const carpeta = join(__dirname, '../tests/fixtures');

const padron = JSON.parse(readFileSync(join(carpeta, 'padron.json'), 'utf-8'));
const { nombre: hoja, filas } = leerHoja(readFileSync(join(carpeta, '01-polenta-tercera.xlsx')));

const mensaje = armarMensaje({
    archivo: '01-polenta-tercera.xlsx',
    hoja,
    filas,
    padron: padron.jugadores,
    etapas: padron.etapas,
    categorias: ['Segunda', 'Tercera'],
    hoy: new Date('2026-10-05'),
  });
console.log(mensaje);
console.log(`\n${mensaje.length} caracteres`);