// El torneo en vivo (F10): qué partidos van al calendario público.
// Lógica pura: recibe los partidos ya leídos. No toca la base.
import type { EstadoPartido } from './clasificacion';

export type PartidoParaElCalendario = {
  estado: EstadoPartido;
  jugadorAId: number | null;
  jugadorBId: number | null;
  fechaAcordada: Date | null;
};

const CON_RESULTADO: EstadoPartido[] = ['JUGADA', 'WALKOVER', 'ABANDONO'];

// El calendario lista los partidos con fecha, del más próximo al más lejano: así se sabe qué se
// juega cada día. Los jugados quedan, con su resultado; un cancelado no se juega y no va. Con
// la misma fecha, se respeta el orden en que llegaron (zona, cuadro y ronda).
export function partidosDelCalendario<P extends PartidoParaElCalendario>(partidos: P[]): P[] {
  return partidos
    .filter((p) => p.fechaAcordada !== null && p.estado !== 'CANCELADA')
    .sort((a, b) => a.fechaAcordada!.getTime() - b.fechaAcordada!.getTime());
}

// Los que faltan coordinar: tienen a sus dos jugadores, no tienen fecha y no se jugaron.
export function partidosSinFecha(partidos: PartidoParaElCalendario[]) {
  return partidos.filter(
    (p) =>
      p.fechaAcordada === null &&
      p.jugadorAId !== null &&
      p.jugadorBId !== null &&
      p.estado !== 'CANCELADA' &&
      !CON_RESULTADO.includes(p.estado),
  ).length;
}
