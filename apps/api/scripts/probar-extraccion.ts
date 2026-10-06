import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leerPlanilla } from '../src/modules/padron/importacion/leer-planilla';
import { armarMensaje } from '../src/modules/padron/importacion/prompt';
import { extraerConIA } from '../src/modules/padron/importacion/extraer-con-ia';

async function main() {
  const carpeta = join(__dirname, '../tests/fixtures');
  const padron = JSON.parse(readFileSync(join(carpeta, 'padron.json'), 'utf-8'));
  const filas = leerPlanilla(readFileSync(join(carpeta, '01-polenta-tercera.xlsx')));

  const mensaje = armarMensaje(filas, padron.jugadores, padron.etapas, new Date('2026-10-05'));

  const inicio = Date.now();
  const resultado = await extraerConIA(mensaje, padron.etapas);
  const segundos = (Date.now() - inicio) / 1000;

  console.log(`Tardó ${segundos} s`);

  if (!resultado.ok) {
    console.log('ERROR:', resultado.error);
    console.log(resultado.crudo);
    return;
  }

  const { respuesta, tokens } = resultado;
  console.log('Tokens:', tokens);
  console.log('¿Es planilla de jugadores?', respuesta.esPlanillaDeJugadores);
  console.log('Jugadores:', respuesta.jugadores.length);
  console.log(JSON.stringify(respuesta.jugadores.slice(0, 2), null, 2));
}

main();