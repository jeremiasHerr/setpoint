import type { DecisionImportacion, FilaPropuesta, HojaImportada, Importacion } from '@setpoint/shared';

// Por hoja y fila: cada hoja del lote tiene sus filas (decisión 012).
export type Decisiones = Record<string, DecisionImportacion>;

export const claveDe = (hoja: number, fila: number) => `${hoja}:${fila}`;

// Las hojas que se pudieron leer: las que tienen propuesta y entran al confirmar.
export const hojasLeidas = (importacion: Importacion) => importacion.hojas.filter((h) => h.estado !== 'ERROR');

// Problemas de la auditoría de una hoja, agrupados por fila. Los globales (fila null) no van a ninguna.
export function problemasPorFila(hoja: HojaImportada) {
  const porFila = new Map<number, string[]>();
  for (const { fila, detalle } of hoja.problemas) {
    if (fila === null) continue;
    porFila.set(fila, [...(porFila.get(fila) ?? []), detalle]);
  }
  return porFila;
}

// Lo que hay que mirar: lo que la API no pudo importar sola, con su motivo, y todavía no se aplicó
// (decisión 118). Las demás se importan sin preguntar.
export const necesitaRevision = (fila: FilaPropuesta) => fila.revisar !== null && !fila.aplicada;

// Lo que se hace con una fila que se importa sola: vincularla a quien coincide, o darla de alta.
export function decisionSegura(hoja: number, f: FilaPropuesta): DecisionImportacion {
  return f.coincideCon !== null
    ? { hoja, fila: f.fila, accion: 'vincular', jugadorId: f.coincideCon }
    : { hoja, fila: f.fila, accion: 'crear' };
}

// Lo que propone la pantalla para las filas a revisar, antes de que la organización toque nada. Una
// fila con problemas arranca excluida: no se carga un número que no está en la planilla sin que
// alguien lo mire.
export function decisionesIniciales(importacion: Importacion): Decisiones {
  const decisiones: Decisiones = {};
  for (const hoja of hojasLeidas(importacion)) {
    const conProblemas = problemasPorFila(hoja);
    for (const f of hoja.propuesta.filter(necesitaRevision)) {
      const base = { hoja: hoja.id, fila: f.fila };
      decisiones[claveDe(hoja.id, f.fila)] = conProblemas.has(f.fila)
        ? { ...base, accion: 'excluir' }
        : f.coincideCon !== null
          ? { ...base, accion: 'vincular', jugadorId: f.coincideCon }
          : { ...base, accion: 'crear' };
    }
  }
  return decisiones;
}

// "10 · 15 · 50 · 15 · 75 = 165", como en la planilla.
export function casillerosComoTexto(fila: FilaPropuesta) {
  const puntos = fila.casilleros.map((c) => c.puntos);
  const total = puntos.reduce((suma, p) => suma + p, 0);
  return `${puntos.join(' · ')} = ${total}`;
}

// Cada etapa con el año que se le asignó, en el orden de la planilla: "Verano 2026".
export function casillerosLeidos(propuesta: FilaPropuesta[]) {
  const vistos = new Set<string>();
  for (const f of propuesta) for (const c of f.casilleros) vistos.add(`${c.etapa} ${c.anio}`);
  return [...vistos];
}
