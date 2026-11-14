// Capa 4 de la importación: audita el contenido de la respuesta de la IA contra la planilla.
// El schema garantiza la forma; esto verifica que los números y las filas existan de verdad.
// Lógica pura: no llama a la IA ni toca la base.
import type { Celda, FilaPlanilla } from './leer-planilla';
import type { RespuestaImportacion } from './schema-respuesta';

export type Problema = { fila: number | null; detalle: string };
export type Auditoria = { globales: Problema[]; porFila: Problema[] };

// Por debajo de esta proporción de jugadores sobre filas con números, la IA se salteó filas.
const PROPORCION_MINIMA = 0.8;

const TEXTO_NUMERICO = /^-?\d+([.,]\d+)?$/;

function comoNumero(celda: Celda): number | null {
  if (typeof celda === 'number') return celda;
  if (celda !== null && TEXTO_NUMERICO.test(celda)) return Number(celda.replace(',', '.'));
  return null;
}

export function numerosDeFila(celdas: Celda[]): number[] {
  return celdas.map(comoNumero).filter((n): n is number => n !== null);
}

export function auditar(
  respuesta: RespuestaImportacion,
  filas: FilaPlanilla[],
  idsPadron: number[],
): Auditoria {
  const globales: Problema[] = [];
  const porFila: Problema[] = [];
  const { jugadores } = respuesta;

  if (!respuesta.esPlanillaDeJugadores && jugadores.length > 0) {
    globales.push({
      fila: null,
      detalle: `Dijiste que no es una planilla de jugadores, pero devolviste ${jugadores.length} jugadores`,
    });
  }

  // Las etapas son texto libre en el schema (decisión 011): que cada casillero use una de la lista
  // se controla acá. Una etapa fuera de la lista es un error de toda la respuesta, y se reintenta.
  const etapas = new Set(respuesta.etapas);
  if (etapas.size < respuesta.etapas.length) {
    globales.push({ fila: null, detalle: 'La lista de etapas tiene nombres repetidos' });
  }
  const desconocidas = new Set(jugadores.flatMap((j) => j.casilleros.map((c) => c.etapa)).filter((e) => !etapas.has(e)));
  if (desconocidas.size > 0) {
    globales.push({
      fila: null,
      detalle: `Los casilleros usan etapas que no están en la lista de etapas: ${[...desconocidas].join(', ')}`,
    });
  }

  const filaPorNumero = new Map(filas.map((f) => [f.fila, f]));
  const padron = new Set(idsPadron);
  const vistas = new Set<number>();

  for (const jugador of jugadores) {
    const { fila: numero } = jugador;
    const problema = (detalle: string) => porFila.push({ fila: numero, detalle: `Fila ${numero}: ${detalle}` });

    if (vistas.has(numero)) {
      problema('aparece más de una vez');
      continue;
    }
    vistas.add(numero);

    const fila = filaPorNumero.get(numero);
    if (!fila) {
      problema('no existe en la planilla');
      continue;
    }

    const numeros = numerosDeFila(fila.celdas);
    const tieneVacias = fila.celdas.some((c) => c === null);

    // Una celda vacía también lleva su casillero: cada jugador tiene uno por etapa.
    const suyas = new Set(jugador.casilleros.map((c) => c.etapa));
    for (const etapa of etapas) {
      if (!suyas.has(etapa)) problema(`no tiene casillero de ${etapa}`);
    }

    for (const { etapa, anio, puntos } of jugador.casilleros) {
      const estaEnLaFila = numeros.includes(puntos) || (puntos === 0 && tieneVacias);
      if (!estaEnLaFila) problema(`el ${puntos} de ${etapa} ${anio} no está en la planilla`);
    }

    if (jugador.acumulado !== null) {
      const suma = jugador.casilleros.reduce((total, c) => total + c.puntos, 0);
      if (!numeros.includes(jugador.acumulado)) {
        problema(`el acumulado ${jugador.acumulado} no está en la planilla`);
      } else if (jugador.acumulado !== suma) {
        problema(`el acumulado es ${jugador.acumulado} pero los casilleros suman ${suma}`);
      }
    }

    if (jugador.coincideCon !== null && !padron.has(jugador.coincideCon)) {
      problema(`el id ${jugador.coincideCon} no está en el padrón`);
    }
  }

  if (respuesta.esPlanillaDeJugadores) {
    const filasConNumeros = filas.filter((f) => numerosDeFila(f.celdas).length >= 2).length;
    if (jugadores.length < PROPORCION_MINIMA * filasConNumeros) {
      globales.push({
        fila: null,
        detalle: `Devolviste ${jugadores.length} jugadores, pero la planilla tiene ${filasConNumeros} filas con puntos. Faltan jugadores`,
      });
    }
  }

  return { globales, porFila };
}
