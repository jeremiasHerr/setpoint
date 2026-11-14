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

// Lo que hay que mirar antes de confirmar: un número que no cierra o un nombre dudoso.
export function necesitaRevision(fila: FilaPropuesta, problemas: string[] | undefined) {
  return problemas !== undefined || (fila.coincideCon !== null && fila.confianza !== 'alta');
}

// Lo que propone la pantalla antes de que la organización toque nada. Una fila con
// problemas arranca excluida: no se carga un número que no está en la planilla sin que alguien lo mire.
export function decisionesIniciales(importacion: Importacion): Decisiones {
  const decisiones: Decisiones = {};
  for (const hoja of hojasLeidas(importacion)) {
    const conProblemas = problemasPorFila(hoja);
    for (const f of hoja.propuesta) {
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
