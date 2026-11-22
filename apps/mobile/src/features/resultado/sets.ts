// Los sets de Cargar el resultado (decisión 127). El jugador los escribe desde su lado, "vos" y "el
// rival"; la API los espera con los games de A primero. Lógica pura, sin React.
import { resultadoDelTorneoSchema, type DatosResultadoDelJugador, type SistemaDeJuego } from '@setpoint/shared';

// Lo que hay escrito en cada casillero: texto, porque puede estar vacío o a medio escribir.
export type FilaDeSet = { mios: string; suyos: string };

export const filaVacia = (): FilaDeSet => ({ mios: '', suyos: '' });

const numero = (texto: string) => (/^\d{1,2}$/.test(texto) ? Number(texto) : null);

// El set decisivo es un super tie-break si el torneo lo juega así: el tercero, o el quinto.
export const esSuperTieBreak = (sistema: SistemaDeJuego, indice: number) =>
  sistema.terceroSet === 'super_tiebreak' && indice === sistema.setsPorPartido - 1;

// Cuántas filas se muestran: las que hacen falta para ganar, y una más cada vez que van parejos.
// Con dos sets por lado en un partido a tres, aparece el tercero; a cinco, hasta el quinto.
export function filasVisibles(sistema: SistemaDeJuego, filas: FilaDeSet[]) {
  const paraGanar = Math.ceil(sistema.setsPorPartido / 2);
  let mios = 0;
  let suyos = 0;
  let visibles = paraGanar;
  for (let i = 0; i < sistema.setsPorPartido; i++) {
    const a = numero(filas[i]?.mios ?? '');
    const b = numero(filas[i]?.suyos ?? '');
    if (a === null || b === null || a === b) break;
    if (a > b) mios++;
    else suyos++;
    if (mios === paraGanar || suyos === paraGanar) return i + 1;
    visibles = Math.max(visibles, i + 2);
  }
  return Math.min(visibles, sistema.setsPorPartido);
}

// Los sets en el orden de la API, o null si falta algún casillero de las filas que se ven.
export function setsParaMandar(sistema: SistemaDeJuego, filas: FilaDeSet[], esA: boolean) {
  const sets = [];
  for (let i = 0; i < filasVisibles(sistema, filas); i++) {
    const mios = numero(filas[i]?.mios ?? '');
    const suyos = numero(filas[i]?.suyos ?? '');
    if (mios === null || suyos === null) return null;
    sets.push({
      gamesA: esA ? mios : suyos,
      gamesB: esA ? suyos : mios,
      tieBreakA: null,
      tieBreakB: null,
      esSuperTieBreak: esSuperTieBreak(sistema, i),
    });
  }
  return sets;
}

// El primer problema con las reglas del torneo, en las palabras del schema compartido: lo mismo
// que rechazaría la API, con el set adelante. null si el resultado está bien.
export function problemaDelResultado(sistema: SistemaDeJuego, datos: DatosResultadoDelJugador) {
  const validado = resultadoDelTorneoSchema(sistema).safeParse(datos);
  if (validado.success) return null;
  const [problema] = validado.error.issues;
  if (!problema) return 'Revisá el resultado';
  const [campo, indice] = problema.path;
  if (campo !== 'sets' || typeof indice !== 'number') return problema.message;
  const cual = esSuperTieBreak(sistema, indice) ? 'Super tie-break' : `Set ${indice + 1}`;
  return `${cual}: ${problema.message}`;
}
