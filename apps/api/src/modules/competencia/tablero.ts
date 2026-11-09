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

// Un partido para la tarjeta del inicio: el del tablero, más dónde va en los cuadros. Los de zona
// no tienen cuadro ni ronda.
export type PartidoDelAvance = PartidoParaElTablero & { cuadro: 'CAMPEONATO' | 'COMPLEMENTARIA' | null; ronda: number | null };

// Cómo viene el torneo, para su tarjeta en el inicio (decisión 080). Con las mismas cuentas que el
// tablero: un vencido o el plazo que corre son lo mismo en las dos pantallas.
export function avanceDelTorneo(partidos: PartidoDelAvance[], hoy: string) {
  const situaciones = partidos.map((p) => situacionDelPartido(p, hoy));
  const cuantos = (situacion: SituacionDelPartido) => situaciones.filter((s) => s === situacion).length;
  const plazo = plazoQueCorre(partidos, hoy);

  // La ronda que marca el plazo: la del partido de cuadro pendiente que vence primero.
  const marca = plazo
    ? partidos.find(
        (p, i) =>
          p.cuadro !== null &&
          p.fechaLimite !== null &&
          dia(p.fechaLimite) === plazo.fechaLimite &&
          situaciones[i] !== 'jugado' &&
          situaciones[i] !== 'esperando',
      )
    : undefined;
  const ronda = marca
    ? { ronda: marca.ronda!, rondas: Math.max(...partidos.filter((p) => p.cuadro === marca.cuadro).map((p) => p.ronda!)) }
    : null;

  return { partidos: partidos.length, jugados: cuantos('jugado'), vencidos: cuantos('vencido'), plazo, ronda };
}

// Lo que falta, del plazo más viejo al más nuevo: un vencido hace más días va primero. Sin fecha
// límite, al final. Con el mismo plazo, se respeta el orden en que llegaron (zona, cuadro y ronda).
export function porUrgencia<P extends { dias: number | null }>(partidos: P[]): P[] {
  const dias = (p: P) => p.dias ?? Infinity;
  return [...partidos].sort((a, b) => dias(a) - dias(b));
}
