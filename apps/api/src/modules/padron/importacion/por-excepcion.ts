// Importación automática por excepción (decisión 118): qué filas se importan solas y por qué va a
// revisión cada una de las demás. Lógica pura: no llama a la IA ni toca la base.
import type { DecisionImportacion, FilaExtraida } from '@setpoint/shared';
import type { Auditoria } from './auditar';
import { normalizar } from './entre-hojas';

// El motivo por el que una fila va a revisión, o null si se importa sola. Se importa sola si:
//   1. la auditoría no le encontró problemas, ni a ella ni a la hoja (incluye el control entre hojas)
//   2. su identidad es segura: coincide con el padrón con confianza alta, o es claramente nueva. Que
//      sea nueva lo dice el modelo, pero lo verifica el código: si ya hay un jugador activo con ese
//      apellido, un existente que la IA tomó por nuevo quedaría duplicado, con el ranking partido.
// La fuente es siempre auditable: Excel, CSV, PDF con texto o texto pegado, todos con texto contra el
// cual verificar cada número (decisión 140). Las imágenes todavía no se importan.
export function motivoDeRevision(fila: FilaExtraida, auditoria: Auditoria, apellidosDelPadron: Set<string>): string | null {
  if (auditoria.globales.length > 0) return 'La planilla entera tuvo un problema al leerla';
  const problema = auditoria.porFila.find((p) => p.fila === fila.fila);
  if (problema) return problema.detalle;
  if (fila.coincideCon !== null) {
    return fila.confianza === 'alta' ? null : 'No es seguro que sea el jugador del padrón';
  }
  if (apellidosDelPadron.has(normalizar(fila.apellido))) return `Ya hay un ${fila.apellido} en el padrón`;
  return null;
}

// Por número de fila, las que van a revisión con su motivo. Las que no están se importan solas.
export function filasARevisar(propuesta: FilaExtraida[], auditoria: Auditoria, apellidosDelPadron: Set<string>) {
  const revisar: Record<number, string> = {};
  for (const fila of propuesta) {
    const motivo = motivoDeRevision(fila, auditoria, apellidosDelPadron);
    if (motivo !== null) revisar[fila.fila] = motivo;
  }
  return revisar;
}

// Lo que la organización habría decidido para una fila segura: vincular a quien coincide, o crearlo.
export function decisionSegura(hoja: number, fila: FilaExtraida): DecisionImportacion {
  return fila.coincideCon !== null
    ? { hoja, fila: fila.fila, accion: 'vincular', jugadorId: fila.coincideCon }
    : { hoja, fila: fila.fila, accion: 'crear' };
}

export const apellidosNormalizados = (jugadores: { apellido: string }[]) => new Set(jugadores.map((j) => normalizar(j.apellido)));
