// Tablero del torneo (F15): en qué situación está cada partido y qué falta.
// Lógica pura: recibe los partidos ya leídos y el día de hoy. No toca la base.
import type { SituacionDelPartido } from '@setpoint/shared';
import type { EstadoPartido } from './clasificacion';

export type PartidoParaElTablero = {
  estado: EstadoPartido;
  jugadorAId: number | null;
  jugadorBId: number | null;
  // Se guarda como la medianoche UTC del último día para jugarlo.
  fechaLimite: Date | null;
  fechaAcordada: Date | null;
};

const CON_RESULTADO: EstadoPartido[] = ['JUGADA', 'WALKOVER', 'ABANDONO'];
const CON_FECHA: EstadoPartido[] = ['ANOTADA', 'CONFIRMADA'];
const UN_DIA = 24 * 60 * 60 * 1000;

const dia = (fecha: Date) => fecha.toISOString().slice(0, 10);

// Días desde hoy ('AAAA-MM-DD', en Argentina) hasta la fecha límite: 0 si vence hoy, -1 si venció ayer.
export function diasHasta(fechaLimite: Date, hoy: string) {
  return Math.round((Date.parse(dia(fechaLimite)) - Date.parse(hoy)) / UN_DIA);
}

// Vencido se calcula, no se guarda: pasó la fecha límite y no tiene resultado (decisión 060).
// Uno con fecha acordada también vence si no se jugó a tiempo. El estado VENCIDA del schema no
// se escribe; si apareciera, cuenta como un partido sin resultado.
export function situacionDelPartido(partido: PartidoParaElTablero, hoy: string): SituacionDelPartido {
  if (CON_RESULTADO.includes(partido.estado)) return 'jugado';
  if (partido.jugadorAId === null || partido.jugadorBId === null) return 'esperando';
  if (partido.fechaLimite && diasHasta(partido.fechaLimite, hoy) < 0) return 'vencido';
  if (CON_FECHA.includes(partido.estado) || partido.fechaAcordada) return 'con_fecha';
  return 'sin_coordinar';
}

// El plazo que corre: la fecha límite más cercana de los partidos que todavía se pueden jugar.
// En la fase de grupos es una sola; en los cuadros, la de la ronda más atrasada. null si no
// queda nada pendiente o ningún partido tiene fecha límite.
export function plazoQueCorre(partidos: PartidoParaElTablero[], hoy: string) {
  const pendientes = partidos.filter((p) => {
    const situacion = situacionDelPartido(p, hoy);
    return situacion !== 'jugado' && situacion !== 'esperando' && p.fechaLimite !== null;
  });
  if (pendientes.length === 0) return null;
  const masCercana = pendientes.reduce((a, b) => (a.fechaLimite! <= b.fechaLimite! ? a : b)).fechaLimite!;
  return { fechaLimite: dia(masCercana), dias: diasHasta(masCercana, hoy) };
}

// Lo que falta, del plazo más viejo al más nuevo: un vencido hace más días va primero. Sin fecha
// límite, al final. Con el mismo plazo, se respeta el orden en que llegaron (zona, cuadro y ronda).
export function porUrgencia<P extends { dias: number | null }>(partidos: P[]): P[] {
  const dias = (p: P) => p.dias ?? Infinity;
  return [...partidos].sort((a, b) => dias(a) - dias(b));
}
