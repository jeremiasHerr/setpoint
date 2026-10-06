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
