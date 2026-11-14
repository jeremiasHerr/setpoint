// Eval de la importación: corre las planillas de tests/fixtures contra la API real y
// compara con su .esperado.json. Cuesta ~$0,10 por corrida.
// Cada planilla usa el padrón, las etapas y las categorías de padron.json, salvo que tenga su
// propio <nombre>.contexto.json (por ejemplo, un circuito recién registrado, sin nada cargado).
// Si el .esperado.json trae categoria y etapas, también se compara lo detectado (decisión 011).
// Uso: npm run eval:importacion -w apps/api
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { procesarPlanilla } from '../src/modules/padron/importacion/procesar-planilla';

// Precio de Haiku 4.5, en dólares por millón de tokens.
const PRECIO = { entrada: 1, salida: 5 };
const HOY = new Date('2026-10-05');

type Casillero = { etapa: string; anio: number; puntos: number };
type JugadorEsperado = { fila: number; casilleros: Casillero[]; acumulado: number | null; coincideCon: number | null };
type Esperado = { esPlanillaDeJugadores: boolean; categoria?: string | null; etapas?: string[]; jugadores: JugadorEsperado[] };
type Contexto = { jugadores: { id: number; nombre: string; apellido: string }[]; etapas: string[]; categorias: string[] };

const CATEGORIAS = ['Segunda', 'Tercera'];

type Comparacion = { aciertos: number; total: number; diferencias: string[] };

function comparar(esperado: Esperado, obtenido: Esperado, etapas: string[]): Comparacion {
  const c: Comparacion = { aciertos: 0, total: 0, diferencias: [] };
  const chequear = (ok: boolean, diferencia: string) => {
    c.total++;
    if (ok) c.aciertos++;
    else c.diferencias.push(diferencia);
  };

  chequear(
    esperado.esPlanillaDeJugadores === obtenido.esPlanillaDeJugadores,
    `esPlanillaDeJugadores: esperaba ${esperado.esPlanillaDeJugadores}, vino ${obtenido.esPlanillaDeJugadores}`,
  );
  if (esperado.categoria !== undefined) {
    chequear(esperado.categoria === obtenido.categoria, `categoria: esperaba ${esperado.categoria}, vino ${obtenido.categoria}`);
  }
  if (esperado.etapas !== undefined) {
    const texto = (etapas?: string[]) => (etapas ?? []).join(', ');
    chequear(texto(esperado.etapas) === texto(obtenido.etapas), `etapas: esperaba ${texto(esperado.etapas)}, vino ${texto(obtenido.etapas)}`);
  }
  chequear(
    esperado.jugadores.length === obtenido.jugadores.length,
    `cantidad de jugadores: esperaba ${esperado.jugadores.length}, vinieron ${obtenido.jugadores.length}`,
  );

  const obtenidos = new Map(obtenido.jugadores.map((j) => [j.fila, j]));
  for (const e of esperado.jugadores) {
    const o = obtenidos.get(e.fila);
    obtenidos.delete(e.fila);
    if (!o) {
      // Una fila que falta cuenta como error en todos sus campos.
      const campos = etapas.length + 2;
      c.total += campos;
      c.diferencias.push(`fila ${e.fila}: falta (${campos} campos)`);
      continue;
    }
    for (const etapa of etapas) {
      const pe = e.casilleros.find((x) => x.etapa === etapa);
      const po = o.casilleros.find((x) => x.etapa === etapa);
      const texto = (x?: Casillero) => (x ? `${x.puntos} (${x.anio})` : 'nada');
      chequear(
        pe?.puntos === po?.puntos && pe?.anio === po?.anio,
        `fila ${e.fila} ${etapa}: esperaba ${texto(pe)}, vino ${texto(po)}`,
      );
    }
    chequear(e.acumulado === o.acumulado, `fila ${e.fila} acumulado: esperaba ${e.acumulado}, vino ${o.acumulado}`);
    chequear(e.coincideCon === o.coincideCon, `fila ${e.fila} coincideCon: esperaba ${e.coincideCon}, vino ${o.coincideCon}`);
  }
  for (const fila of obtenidos.keys()) {
    c.total++;
    c.diferencias.push(`fila ${fila}: sobra`);
  }
  return c;
}

async function main() {
  const carpeta = join(__dirname, '../tests/fixtures');
  const padron = JSON.parse(readFileSync(join(carpeta, 'padron.json'), 'utf-8'));
  const planillas = readdirSync(carpeta).filter((f) => f.endsWith('.xlsx')).sort();

  const total = { aciertos: 0, total: 0, entrada: 0, salida: 0, segundos: 0 };

  for (const planilla of planillas) {
    const nombre = planilla.replace(/\.xlsx$/, '');
    const esperado: Esperado = JSON.parse(readFileSync(join(carpeta, `${nombre}.esperado.json`), 'utf-8'));
    const propio = join(carpeta, `${nombre}.contexto.json`);
    const contexto: Contexto = existsSync(propio)
      ? JSON.parse(readFileSync(propio, 'utf-8'))
      : { jugadores: padron.jugadores, etapas: padron.etapas, categorias: CATEGORIAS };

    const inicio = Date.now();
    const resultado = await procesarPlanilla(readFileSync(join(carpeta, planilla)), {
      archivo: planilla,
      padron: contexto.jugadores,
      etapas: contexto.etapas,
      categorias: contexto.categorias,
      hoy: HOY,
    });
    const segundos = (Date.now() - inicio) / 1000;

    const obtenido: Esperado = resultado.ok ? resultado.respuesta : { esPlanillaDeJugadores: false, jugadores: [] };
    const c = comparar(esperado, obtenido, esperado.etapas ?? contexto.etapas);

    total.aciertos += c.aciertos;
    total.total += c.total;
    total.entrada += resultado.tokens.entrada;
    total.salida += resultado.tokens.salida;
    total.segundos += segundos;

    console.log(`\n── ${nombre}`);
    console.table({
      aciertos: `${c.aciertos} / ${c.total}`,
      intentos: resultado.intentos,
      tokens: `${resultado.tokens.entrada} entrada · ${resultado.tokens.salida} salida`,
      segundos: segundos.toFixed(1),
    });
    if (!resultado.ok) console.log(`  ERROR: ${resultado.error}`);
    for (const d of c.diferencias) console.log(`  ≠ ${d}`);
    for (const p of resultado.auditoria?.porFila ?? []) console.log(`  ⚠ auditoría: ${p.detalle}`);
  }

  const costo = (total.entrada * PRECIO.entrada + total.salida * PRECIO.salida) / 1_000_000;
  console.log('\n══ Total');
  console.table({
    aciertos: `${total.aciertos} / ${total.total} (${((100 * total.aciertos) / total.total).toFixed(1)} %)`,
    tokens: `${total.entrada} entrada · ${total.salida} salida`,
    costo: `US$ ${costo.toFixed(3)}`,
    segundos: total.segundos.toFixed(1),
  });
}

main();
