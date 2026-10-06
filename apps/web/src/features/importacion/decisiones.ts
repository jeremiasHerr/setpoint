import type { DecisionImportacion, FilaPropuesta, Importacion } from '@setpoint/shared';

export type Decisiones = Record<number, DecisionImportacion>;

// Problemas de la auditoría agrupados por fila. Los globales (fila null) no van a ninguna.
export function problemasPorFila(importacion: Importacion) {
  const porFila = new Map<number, string[]>();
  for (const { fila, detalle } of importacion.problemas) {
    if (fila === null) continue;
    porFila.set(fila, [...(porFila.get(fila) ?? []), detalle]);
  }
  return porFila;
}

// Lo que hay que mirar antes de confirmar: un número que no cierra o un nombre dudoso.
export function necesitaRevision(fila: FilaPropuesta, problemas: string[] | undefined) {
  return problemas !== undefined || (fila.coincideCon !== null && fila.confianza !== 'alta');
}

// Lo que propone la pantalla antes de que la organización toque nada. Una fila con
// problemas arranca excluida: no se carga un número que no está en la planilla sin que alguien lo mire.
export function decisionesIniciales(importacion: Importacion): Decisiones {
  const conProblemas = problemasPorFila(importacion);
  const decisiones: Decisiones = {};
  for (const f of importacion.propuesta) {
    decisiones[f.fila] = conProblemas.has(f.fila)
      ? { fila: f.fila, accion: 'excluir' }
      : f.coincideCon !== null
        ? { fila: f.fila, accion: 'vincular', jugadorId: f.coincideCon }
        : { fila: f.fila, accion: 'crear' };
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
