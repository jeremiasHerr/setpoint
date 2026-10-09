import type { FilaPlanilla } from './leer-planilla';

export const VERSION_PROMPT = 'importacion-v1.1';

export const INSTRUCCIONES = `Extraés rankings de tenis amateur desde planillas.

Vas a recibir las etapas del circuito, el padrón actual de jugadores y el contenido de una planilla, fila por fila, con su número de fila.

Reglas:
- Si la planilla no es un ranking ni un listado de jugadores, devolvé esPlanillaDeJugadores: false, el motivo, y ningún jugador.
- Ignorá filas de títulos, encabezados (aunque se repitan), totales y notas.
- En "fila" poné el número de fila exactamente como aparece en la planilla.
- Copiá los puntos tal cual están en la celda. Nunca calcules, redondees ni corrijas un número.
- Una celda vacía en un casillero vale 0 puntos, y el casillero se incluye igual.
- Los años de dos dígitos son del 2000: "25" es 2025.
- Si un encabezado abarca dos años ("Verano 25/26"), usá el año en que termina: 2026.
- Si la planilla tiene una columna de total, copiala en "acumulado". Si no tiene, null.
- Si un jugador es alguien del padrón, poné su id en "coincideCon" y usá el nombre y apellido como están en el padrón. Indicá tu confianza: "alta" si no hay dudas, "media" si el nombre está escrito distinto pero es claro, "baja" si podría ser más de una persona.
- Si no hay nadie parecido en el padrón, es un jugador nuevo: coincideCon y confianza en null, y el nombre como está en la planilla, separado en nombre y apellido.
Ejemplo:

<ejemplo>
<etapas>
Primavera, Verano
</etapas>

<padron>
id 7: Lucía Ferrero
id 9: Tomás Rivas
</padron>

<planilla>
fila 1: Ranking Damas
fila 3: Jugadora | Prim 25 | Ver 26 | Total
fila 4: FERRERO, Lucia | 50 |  | 50
fila 5: Paula Quiroga | 10 | 25 | 35
fila 6: Total | 60 | 25 | 85
</planilla>

Respuesta:
{"esPlanillaDeJugadores":true,"motivo":null,"jugadores":[{"fila":4,"nombre":"Lucía","apellido":"Ferrero","casilleros":[{"etapa":"Primavera","anio":2025,"puntos":50},{"etapa":"Verano","anio":2026,"puntos":0}],"acumulado":50,"coincideCon":7,"confianza":"media"},{"fila":5,"nombre":"Paula","apellido":"Quiroga","casilleros":[{"etapa":"Primavera","anio":2025,"puntos":10},{"etapa":"Verano","anio":2026,"puntos":25}],"acumulado":35,"coincideCon":null,"confianza":null}]}
</ejemplo>`;

type JugadorPadron = { id: number; nombre: string; apellido: string };

function filaComoTexto(f: FilaPlanilla): string {
  const celdas = f.celdas.map((c) => (c === null ? '' : String(c)));
  return `fila ${f.fila}: ${celdas.join(' | ')}`;
}

export function armarMensaje(
  filas: FilaPlanilla[],
  padron: JugadorPadron[],
  etapas: string[],
  hoy: Date,
): string {
  const lineasPadron = padron.map((j) => `id ${j.id}: ${j.nombre} ${j.apellido}`);
  const lineasPlanilla = filas.map(filaComoTexto);

  return [
    `Fecha de hoy: ${hoy.toISOString().slice(0, 10)}`,
    '',
    `<etapas>\n${etapas.join(', ')}\n</etapas>`,
    '',
    `<padron>\n${lineasPadron.join('\n')}\n</padron>`,
    '',
    `<planilla>\n${lineasPlanilla.join('\n')}\n</planilla>`,
  ].join('\n');
}