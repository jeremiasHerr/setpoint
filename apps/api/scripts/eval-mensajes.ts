// Eval de los resultados desde los mensajes (F19): corre los chats de tests/fixtures/mensajes contra
// la API real y compara con lo esperado. Mide dos cosas (06-ia.md §2):
// - aciertos: cada resultado esperado, encontrado en su partido, con su tipo, su ganador y sus sets;
// - cargados mal: lo que la auditoría dejaría cargar solo y no es lo esperado. Tiene que ser 0: un
//   resultado mal cargado sin revisión es peor que uno de más en revisión.
// Uso: npm run eval:mensajes -w apps/api
import { costoUsd, intentarJson, MODELO_MENSAJES as MODELO } from '../src/lib/ia';
import { auditarLectura, problemasGlobales } from '../src/modules/competencia/mensajes/auditar';
import { armarMensaje, INSTRUCCIONES, VERSION_PROMPT } from '../src/modules/competencia/mensajes/prompt';
import { respuestaMensajesSchema, type ResultadoDeLaIA } from '../src/modules/competencia/mensajes/schema-respuesta';
import { chatsDePrueba, contextoDe, type Esperado } from '../tests/fixtures/mensajes/fixture';


const sets = (r: ResultadoDeLaIA) => r.sets.map((s) => `${s.gamesA}-${s.gamesB}`).join(' ');
const setsEsperados = (e: Esperado) => (e.sets ?? []).map(([a, b]) => `${a}-${b}`).join(' ');

function esElEsperado(r: ResultadoDeLaIA, e: Esperado) {
  return r.partidoId === e.partidoId && r.tipo === e.tipo && r.ganador === e.ganador && (e.sets === null || sets(r) === setsEsperados(e));
}

async function main() {
  const inicio = Date.now();
  const tokens = { entrada: 0, salida: 0 };
  let aciertos = 0;
  let total = 0;
  let cargadosMal = 0;
  let seCargan = 0;

  for (const prueba of chatsDePrueba()) {
    const { contexto, mensajes, paraLaIA } = contextoDe(prueba);
    const pedido = armarMensaje({ torneo: prueba.nombre, sistema: prueba.sistema, partidos: paraLaIA, mensajes });
    const r = await intentarJson(respuestaMensajesSchema, INSTRUCCIONES, pedido, MODELO);
    if (r.tokens) {
      tokens.entrada += r.tokens.entrada;
      tokens.salida += r.tokens.salida;
    }
    console.log(`\n${prueba.nombre}: ${prueba.descripcion}`);
    if (!r.ok) {
      console.log(`  ERROR: ${r.error}`);
      total += prueba.esperado.length;
      continue;
    }
    for (const p of problemasGlobales(r.datos, contexto)) console.log(`  problema global: ${p}`);

    const auditados = auditarLectura(r.datos, contexto);
    for (const e of prueba.esperado) {
      total++;
      const leido = r.datos.resultados.find((x) => x.mensaje === e.mensaje && x.partidoId === e.partidoId);
      if (leido && esElEsperado(leido, e)) aciertos++;
      else console.log(`  #${e.mensaje}: esperaba partido ${e.partidoId} ${e.tipo} gana ${e.ganador} ${setsEsperados(e)}; vino ${leido ? `${leido.tipo} gana ${leido.ganador} ${sets(leido)}` : 'nada'}`);
    }
    for (const [i, x] of r.datos.resultados.entries()) {
      if (auditados[i].estado !== 'seguro') {
        console.log(`  #${x.mensaje} a revisión: ${auditados[i].motivo}`);
        continue;
      }
      seCargan++;
      const e = prueba.esperado.find((y) => y.mensaje === x.mensaje && y.partidoId === x.partidoId);
      if (!e || !esElEsperado(x, e)) {
        cargadosMal++;
        console.log(`  CARGADO MAL #${x.mensaje}: partido ${x.partidoId} ${x.tipo} gana ${x.ganador} ${sets(x)}`);
      }
    }
  }

  const costo = costoUsd(tokens, MODELO);
  console.log(`\n${MODELO} · ${VERSION_PROMPT}`);
  console.log(`Aciertos: ${aciertos} / ${total} · Se cargan solos: ${seCargan} · Cargados mal: ${cargadosMal}`);
  console.log(`Tokens: ${tokens.entrada} · ${tokens.salida} · US$ ${costo.toFixed(3)} · ${Math.round((Date.now() - inicio) / 1000)} s`);
  if (cargadosMal > 0) process.exitCode = 1;
}

void main();
