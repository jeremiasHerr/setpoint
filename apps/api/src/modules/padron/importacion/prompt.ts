import type { FilaPlanilla } from './leer-planilla';

// v2: detecta la categoría y los torneos del calendario de la planilla (decisión 011).
// v2.1: el nombre de la hoja es la categoría, aunque no diga "Ranking" (libros de varias hojas, decisión 012).
export const VERSION_PROMPT = 'importacion-v2.1';

export const INSTRUCCIONES = `Extraés rankings de tenis amateur desde planillas.

Vas a recibir el nombre del archivo y de la hoja, las categorías y los torneos del calendario ("etapas") que ya tiene el circuito (pueden ser ninguno), el padrón actual de jugadores y el contenido de la planilla, fila por fila, con su número de fila.

Reglas:
- Si la planilla no es un ranking ni un listado de jugadores, devolvé esPlanillaDeJugadores: false, el motivo, categoria null, ninguna etapa y ningún jugador.
- Ignorá filas de títulos, encabezados (aunque se repitan), totales y notas.
- En "fila" poné el número de fila exactamente como aparece en la planilla.
- Copiá los puntos tal cual están en la celda. Nunca calcules, redondees ni corrijas un número.
- Una celda vacía en un casillero vale 0 puntos, y el casillero se incluye igual.
- Los años de dos dígitos son del 2000: "25" es 2025.
- Si un encabezado abarca dos años ("Verano 25/26"), usá el año en que termina: 2026.
- Si la planilla tiene una columna de total, copiala en "acumulado". Si no tiene, null.
- Si un jugador es alguien del padrón, poné su id en "coincideCon" y usá el nombre y apellido como están en el padrón. Indicá tu confianza: "alta" si no hay dudas, "media" si el nombre está escrito distinto pero es claro, "baja" si podría ser más de una persona.
- Si no hay nadie parecido en el padrón, es un jugador nuevo: coincideCon y confianza en null, y el nombre como está en la planilla, separado en nombre y apellido.

Etapas:
- En "etapas" listá los torneos del calendario de los encabezados de las columnas de puntos, en el orden de las columnas, una vez cada uno y sin el año.
- Si un encabezado es una de las etapas del circuito, usá ese nombre exacto: "Prim 25" es "Primavera".
- Si no es ninguna, escribí el nombre del torneo con mayúscula inicial, y completo si el encabezado lo abrevia de forma obvia: "PRETEMP 26" es "Pretemporada".
- Cada casillero de cada jugador usa una etapa de esa lista.

Categoría:
- En "categoria" poné la categoría de los jugadores si la planilla la dice: en el nombre de la hoja, en un título o en el nombre del archivo ("Ranking Tercera 2026.xlsx" es "Tercera").
- Un libro con varias hojas suele tener una hoja por categoría: si la hoja se llama "Segunda", "Tercera" o "Damas", esa es la categoría, aunque no diga "Ranking". Los nombres genéricos ("Hoja1", "Sheet1", "Ranking") no son una categoría.
- Si es una de las categorías del circuito, usá ese nombre exacto. Si no la dice en ningún lado, null: no la adivines.

Ejemplo:

<ejemplo>
<archivo>ranking.xlsx</archivo>
<hoja>Hoja1</hoja>

<categorias>
Damas, Caballeros
</categorias>

<etapas>
Primavera, Verano
</etapas>

<padron>
id 7: Lucía Ferrero
id 9: Tomás Rivas
</padron>

<planilla>
fila 1: Ranking Damas
fila 3: Jugadora | Prim 25 | Ver 26 | Pretemp 26 | Total
fila 4: FERRERO, Lucia | 50 |  | 10 | 60
fila 5: Paula Quiroga | 10 | 25 |  | 35
fila 6: Total | 60 | 25 | 10 | 95
</planilla>

Respuesta:
{"esPlanillaDeJugadores":true,"motivo":null,"categoria":"Damas","etapas":["Primavera","Verano","Pretemporada"],"jugadores":[{"fila":4,"nombre":"Lucía","apellido":"Ferrero","casilleros":[{"etapa":"Primavera","anio":2025,"puntos":50},{"etapa":"Verano","anio":2026,"puntos":0},{"etapa":"Pretemporada","anio":2026,"puntos":10}],"acumulado":60,"coincideCon":7,"confianza":"media"},{"fila":5,"nombre":"Paula","apellido":"Quiroga","casilleros":[{"etapa":"Primavera","anio":2025,"puntos":10},{"etapa":"Verano","anio":2026,"puntos":25},{"etapa":"Pretemporada","anio":2026,"puntos":0}],"acumulado":35,"coincideCon":null,"confianza":null}]}
</ejemplo>`;

type JugadorPadron = { id: number; nombre: string; apellido: string };

export type DatosDelMensaje = {
  archivo: string;
  hoja: string;
  filas: FilaPlanilla[];
  padron: JugadorPadron[];
  etapas: string[];
  categorias: string[];
  hoy: Date;
};

function filaComoTexto(f: FilaPlanilla): string {
  const celdas = f.celdas.map((c) => (c === null ? '' : String(c)));
  return `fila ${f.fila}: ${celdas.join(' | ')}`;
}

// Lo que el circuito todavía no tiene se escribe "ninguna": la IA las detecta en la planilla.
const lista = (nombres: string[]) => (nombres.length > 0 ? nombres.join(', ') : 'ninguna');

export function armarMensaje({ archivo, hoja, filas, padron, etapas, categorias, hoy }: DatosDelMensaje): string {
  const lineasPadron = padron.map((j) => `id ${j.id}: ${j.nombre} ${j.apellido}`);
  const lineasPlanilla = filas.map(filaComoTexto);

  return [
    `Fecha de hoy: ${hoy.toISOString().slice(0, 10)}`,
    '',
    `<archivo>${archivo}</archivo>`,
    `<hoja>${hoja}</hoja>`,
    '',
    `<categorias>\n${lista(categorias)}\n</categorias>`,
    '',
    `<etapas>\n${lista(etapas)}\n</etapas>`,
    '',
    `<padron>\n${lineasPadron.join('\n')}\n</padron>`,
    '',
    `<planilla>\n${lineasPlanilla.join('\n')}\n</planilla>`,
  ].join('\n');
}
