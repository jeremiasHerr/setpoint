// Lógica pura de la revisión y la confirmación de una importación: conteos, validación de las
// decisiones de la organización contra la propuesta guardada, y movimientos a crear.
import type { ConteosImportacion, DecisionImportacion, FilaPropuesta } from '@setpoint/shared';
import { ErrorHttp } from '../../../middleware/errores';
import type { Problema } from './auditar';

// Disjuntos, en este orden: una fila con problemas no cuenta como existente aunque coincida.
export function contarFilas(propuesta: FilaPropuesta[], porFila: Problema[]): ConteosImportacion {
  const conProblemas = new Set(porFila.map((p) => p.fila));
  const conteos = { existentes: 0, nuevos: 0, dudosos: 0, conProblemas: 0 };
  for (const j of propuesta) {
    if (conProblemas.has(j.fila)) conteos.conProblemas++;
    else if (j.coincideCon !== null && j.confianza !== 'alta') conteos.dudosos++;
    else if (j.coincideCon !== null) conteos.existentes++;
    else conteos.nuevos++;
  }
  return conteos;
}

// La planilla no dice cuándo se jugó cada etapa: el movimiento importado se fecha el 1° de enero
// del año del casillero. Cualquier torneo real de esa etapa y ese año cierra después y lo
// reemplaza (ver docs/decisiones/008-fecha-de-los-movimientos-importados.md).
export function fechaDelCasillero(anio: number) {
  return new Date(Date.UTC(anio, 0, 1));
}

export type MovimientoAImportar = { etapaId: number; puntos: number; fecha: Date; detalle: string };

export type PlanConfirmacion = {
  crear: { nombre: string; apellido: string; movimientos: MovimientoAImportar[] }[];
  vincular: { jugadorId: number; movimientos: MovimientoAImportar[] }[];
  excluidos: number;
};

function movimientosDe(fila: FilaPropuesta, etapaIds: Map<string, number>): MovimientoAImportar[] {
  // Un casillero en 0 no crea movimiento: un jugador sin puntos en una etapa no tiene casillero.
  return fila.casilleros
    .filter((c) => c.puntos > 0)
    .map((c) => {
      const etapaId = etapaIds.get(c.etapa);
      if (etapaId === undefined) throw new ErrorHttp(409, 'ETAPA_NO_ENCONTRADA');
      return { etapaId, puntos: c.puntos, fecha: fechaDelCasillero(c.anio), detalle: `Planilla: ${c.etapa} ${c.anio}` };
    });
}

// Valida que haya exactamente una decisión por fila de la propuesta y que cada vinculación
// apunte a un jugador distinto de la organización. Los errores van por fila, como en `validar`.
export function planificarConfirmacion(
  propuesta: FilaPropuesta[],
  decisiones: DecisionImportacion[],
  idsJugadores: Set<number>,
  etapaIds: Map<string, number>,
): PlanConfirmacion {
  const campos: Record<string, string> = {};
  const porFila = new Map<number, DecisionImportacion>();
  const vinculados = new Set<number>();

  for (const d of decisiones) {
    const clave = `fila.${d.fila}`;
    if (porFila.has(d.fila)) campos[clave] ??= 'Hay más de una decisión para esta fila';
    porFila.set(d.fila, d);

    if (d.accion !== 'vincular' || d.jugadorId === undefined) continue;
    if (!idsJugadores.has(d.jugadorId)) campos[clave] ??= 'El jugador no está en el padrón';
    else if (vinculados.has(d.jugadorId)) campos[clave] ??= 'Ese jugador ya está vinculado a otra fila';
    vinculados.add(d.jugadorId);
  }

  const filas = new Set(propuesta.map((f) => f.fila));
  for (const fila of porFila.keys()) {
    if (!filas.has(fila)) campos[`fila.${fila}`] ??= 'La fila no está en la importación';
  }
  for (const fila of filas) {
    if (!porFila.has(fila)) campos[`fila.${fila}`] ??= 'Falta decidir qué hacer con esta fila';
  }
  if (Object.keys(campos).length > 0) throw new ErrorHttp(400, 'DATOS_INVALIDOS', campos);

  const plan: PlanConfirmacion = { crear: [], vincular: [], excluidos: 0 };
  for (const fila of propuesta) {
    const d = porFila.get(fila.fila)!;
    if (d.accion === 'excluir') plan.excluidos++;
    else if (d.accion === 'crear') {
      plan.crear.push({ nombre: fila.nombre, apellido: fila.apellido, movimientos: movimientosDe(fila, etapaIds) });
    } else {
      plan.vincular.push({ jugadorId: d.jugadorId!, movimientos: movimientosDe(fila, etapaIds) });
    }
  }
  return plan;
}

// Idempotencia: confirmar dos veces la misma planilla no duplica casilleros.
// Un movimiento existente del jugador para la misma etapa, año y puntos ya es este.
export function yaExiste(
  movimiento: MovimientoAImportar,
  existentes: { etapaId: number | null; puntos: number; fecha: Date }[],
) {
  const anio = movimiento.fecha.getUTCFullYear();
  return existentes.some(
    (e) => e.etapaId === movimiento.etapaId && e.puntos === movimiento.puntos && e.fecha.getUTCFullYear() === anio,
  );
}
