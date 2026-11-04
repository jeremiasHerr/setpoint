// Coordinación de partidos (F14). Lógica pura: qué días se ofrecen, si una fecha vale, qué pasa
// con el partido al anotarla. No toca la base.
import type { AccionDeFecha, BloqueoDeFecha, QuienAnoto } from '@setpoint/shared';
import type { EstadoPartido } from '../competencia/clasificacion';
import { situacionDelPartido } from '../competencia/tablero';

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

// Argentina no tiene horario de verano: siempre UTC−3. El día y la hora que eligen los jugadores
// son los de acá, y el instante se guarda en UTC.
const OFFSET_ARGENTINA = -3 * HORA;


export type ReglasDeReprogramacion = {
  reprogramacionesPermitidas: number;
  horasAntelacionReprogramar: number;
};

export type PartidoACoordinar = {
  estado: EstadoPartido;
  jugadorAId: number | null;
  jugadorBId: number | null;
  fechaLimite: Date | null;
  fechaAcordada: Date | null;
  reprogramaciones: number;
};

// El instante de un día y una hora de Argentina: '2026-11-14' y '10:00' son las 13:00 UTC.
export function instanteEnArgentina(dia: string, hora: string) {
  return new Date(`${dia}T${hora}:00.000-03:00`);
}

// El día y la hora de Argentina de un instante, como los manda la app.
export function diaYHoraEnArgentina(instante: Date) {
  const iso = new Date(instante.getTime() + OFFSET_ARGENTINA).toISOString();
  return { dia: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

// El último día del plazo, incluido. El plazo se guarda como la medianoche UTC de ese día
// (sorteo y cuadros), así que el día es el de la fecha en UTC.
export function ultimoDiaDelPlazo(fechaLimite: Date | null) {
  return fechaLimite?.toISOString().slice(0, 10) ?? null;
}

const siguienteDia = (dia: string) => new Date(new Date(`${dia}T00:00:00.000Z`).getTime() + DIA).toISOString().slice(0, 10);

// Los días que se pueden elegir: de hoy al último del plazo, como en la pantalla de referencia.
// Sin plazo, las dos semanas siguientes. Con el plazo vencido, ninguno.
export function diasDisponibles(hoy: string, ultimoDia: string | null, sinPlazo = 14): string[] {
  const dias: string[] = [];
  for (let dia = hoy; ultimoDia === null ? dias.length < sinPlazo : dia <= ultimoDia; dia = siguienteDia(dia)) {
    dias.push(dia);
  }
  return dias;
}

// Lo que impide coordinar un partido, sea quien sea: que ya tenga resultado, que esté esperando
// al ganador de la ronda anterior, o que haya vencido. Vencido es lo mismo que en el tablero:
// pasó el último día del plazo sin resultado, calculado y no guardado (decisión 060). Lo resuelve
// la organización con el resultado (decisión 062).
function bloqueoDelPartido(partido: PartidoACoordinar, ahora: Date): BloqueoDeFecha | null {
  if (partido.estado === 'CANCELADA') return 'PARTIDO_TERMINADO';
  const situacion = situacionDelPartido(partido, diaYHoraEnArgentina(ahora).dia);
  if (situacion === 'jugado') return 'PARTIDO_TERMINADO';
  if (situacion === 'esperando') return 'SIN_RIVAL';
  if (situacion === 'vencido' || partido.estado === 'VENCIDA') return 'PLAZO_VENCIDO';
  return null;
}

// Qué hace anotar una fecha sobre el partido, o por qué el jugador no puede (02-dominio §8.3):
//   - Sin fecha: la anota.
//   - Con una fecha sin confirmar: la cambia. No es una reprogramación: es el rival que no puede
//     ese día y propone otro, sin un ida y vuelta de propuestas en la app (decisión 065).
//   - Con una fecha confirmada: la reprograma, si le quedan y si falta lo que pide el torneo.
export function accionDeFecha(
  partido: PartidoACoordinar,
  reglas: ReglasDeReprogramacion,
  ahora: Date,
): { accion: AccionDeFecha } | { bloqueo: BloqueoDeFecha } {
  const bloqueo = bloqueoDelPartido(partido, ahora);
  if (bloqueo) return { bloqueo };
  if (partido.estado === 'PENDIENTE_COORDINACION' || partido.fechaAcordada === null) return { accion: 'anotar' };
  if (partido.estado === 'ANOTADA') return { accion: 'cambiar' };

  if (partido.reprogramaciones >= reglas.reprogramacionesPermitidas) return { bloqueo: 'SIN_REPROGRAMACIONES' };
  if (partido.fechaAcordada.getTime() - ahora.getTime() < reglas.horasAntelacionReprogramar * HORA) {
    return { bloqueo: 'SIN_ANTELACION' };
  }
  return { accion: 'reprogramar' };
}

export type ProblemaDeFecha = 'FECHA_PASADA' | 'FUERA_DEL_PLAZO';

// Una fecha vale si todavía no pasó y cae dentro del plazo, también para la organización: el plazo
// no se extiende (decisión 062), y una fecha después del último día ya estaría vencida en el tablero.
export function problemaDeFecha(instante: Date, ultimoDia: string | null, ahora: Date): ProblemaDeFecha | null {
  if (instante.getTime() <= ahora.getTime()) return 'FECHA_PASADA';
  if (ultimoDia !== null && diaYHoraEnArgentina(instante).dia > ultimoDia) return 'FUERA_DEL_PLAZO';
  return null;
}

export type CambioDeFecha = {
  estado: 'ANOTADA' | 'CONFIRMADA';
  reprogramaciones: number;
  evento: 'ANOTADA' | 'CAMBIADA' | 'REPROGRAMADA' | 'CONFIRMADA';
};

// Cómo queda el partido después de anotar. Lo que anota un jugador espera la confirmación del
// rival; lo que carga la organización queda confirmado, porque ella es el registro que hoy es el
// grupo de WhatsApp (decisión 064), y no gasta reprogramaciones. Si la organización guarda sin
// cambios la fecha que anotó un jugador, la está confirmando por el rival: así queda en el historial.
export function cambioDeFecha(
  accion: AccionDeFecha,
  reprogramaciones: number,
  porOrganizacion: boolean,
  sinCambios = false,
): CambioDeFecha {
  const evento = ({ anotar: 'ANOTADA', cambiar: 'CAMBIADA', reprogramar: 'REPROGRAMADA' } as const)[accion];
  if (porOrganizacion) {
    return { estado: 'CONFIRMADA', reprogramaciones, evento: accion === 'cambiar' && sinCambios ? 'CONFIRMADA' : evento };
  }
  return {
    estado: 'ANOTADA',
    reprogramaciones: accion === 'reprogramar' ? reprogramaciones + 1 : reprogramaciones,
    evento,
  };
}

// Qué hace la organización al cargar la fecha: lo mismo que un jugador, sin el límite de
// reprogramaciones ni la antelación. Un partido vencido no: se resuelve con el resultado.
export function accionDeLaOrganizacion(partido: PartidoACoordinar, ahora: Date): { accion: AccionDeFecha } | { bloqueo: BloqueoDeFecha } {
  const bloqueo = bloqueoDelPartido(partido, ahora);
  if (bloqueo) return { bloqueo };
  if (partido.fechaAcordada === null) return { accion: 'anotar' };
  return { accion: partido.estado === 'CONFIRMADA' ? 'reprogramar' : 'cambiar' };
}

// Confirma el rival de quien anotó: el mismo que anotó no puede confirmarse a sí mismo.
export function problemaAlConfirmar(
  partido: { estado: EstadoPartido; anotadaPorId: number | null },
  usuarioId: number,
): 'NADA_PARA_CONFIRMAR' | 'ANOTADA_POR_VOS' | null {
  if (partido.estado !== 'ANOTADA') return 'NADA_PARA_CONFIRMAR';
  if (partido.anotadaPorId === usuarioId) return 'ANOTADA_POR_VOS';
  return null;
}

export type SedeElegida = { clubId: number | null; sedeTexto: string | null };

// Dónde se juega (04-flujo-jugador §6.2). En una instancia con sede designada (en POLENTA, las
// eliminatorias) la pone el torneo y se ignora lo que manden. Si no, un club del circuito o lo
// que escriban, si no está en la lista o el circuito no cargó clubes.
export function sedeElegida(
  modo: 'LIBRE' | 'DESIGNADA',
  clubSedeId: number | null,
  clubesDelCircuito: number[],
  pedido: SedeElegida,
): SedeElegida | 'FALTA_SEDE' | 'CLUB_NO_ENCONTRADO' {
  if (modo === 'DESIGNADA') return { clubId: clubSedeId, sedeTexto: null };
  if (pedido.clubId !== null) {
    return clubesDelCircuito.includes(pedido.clubId) ? { clubId: pedido.clubId, sedeTexto: null } : 'CLUB_NO_ENCONTRADO';
  }
  if (pedido.sedeTexto) return { clubId: null, sedeTexto: pedido.sedeTexto };
  return 'FALTA_SEDE';
}

// Quién cargó la fecha, visto por quien pregunta.
export function quienAnoto(anotadaPorId: number | null, miUsuarioId: number | null, usuarioDelRival: number | null): QuienAnoto | null {
  if (anotadaPorId === null) return null;
  if (anotadaPorId === miUsuarioId) return 'yo';
  if (anotadaPorId === usuarioDelRival) return 'rival';
  return 'organizacion';
}

const DIAS_DE_LA_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// "sáb 14 · 10:00", para los avisos. Igual que en la app (apps/mobile/src/lib/fechas.ts).
export function fechaCorta(instante: Date) {
  const { dia, hora } = diaYHoraEnArgentina(instante);
  const fecha = new Date(`${dia}T00:00:00.000Z`);
  return `${DIAS_DE_LA_SEMANA[fecha.getUTCDay()]} ${fecha.getUTCDate()} · ${hora}`;
}
