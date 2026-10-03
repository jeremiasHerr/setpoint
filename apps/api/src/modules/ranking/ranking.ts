// Ranking por casilleros de etapa con reemplazo (02-dominio.md §7).
// Lógica pura: recibe movimientos, devuelve puntos. No toca la base.

export type MovimientoDeRanking = {
  id: number;
  jugadorId: number;
  etapaId: number | null;
  puntos: number;
  fecha: Date;
};

// Con la misma fecha manda el id más alto: es el que se cargó después.
function esMasReciente(a: MovimientoDeRanking, b: MovimientoDeRanking) {
  const diferencia = a.fecha.getTime() - b.fecha.getTime();
  return diferencia !== 0 ? diferencia > 0 : a.id > b.id;
}

// Puntos vigentes de cada jugador: por cada casillero de etapa vale solo el movimiento
// más reciente, y se suman los casilleros. Los movimientos sin etapa (ajustes manuales)
// no ocupan casillero: se suman todos.
// Los movimientos tienen que ser de una sola categoría: cada una tiene su ranking.
export function puntosVigentes(movimientos: MovimientoDeRanking[]): Map<number, number> {
  const casilleros = new Map<string, MovimientoDeRanking>();
  const puntos = new Map<number, number>();
  const sumar = (jugadorId: number, valor: number) => puntos.set(jugadorId, (puntos.get(jugadorId) ?? 0) + valor);

  for (const movimiento of movimientos) {
    if (movimiento.etapaId === null) {
      sumar(movimiento.jugadorId, movimiento.puntos);
      continue;
    }
    const clave = `${movimiento.jugadorId}:${movimiento.etapaId}`;
    const vigente = casilleros.get(clave);
    if (!vigente || esMasReciente(movimiento, vigente)) casilleros.set(clave, movimiento);
  }

  for (const movimiento of casilleros.values()) sumar(movimiento.jugadorId, movimiento.puntos);
  return puntos;
}

// Puesto de cada jugador según sus puntos. Los empatados comparten puesto y el
// siguiente saltea los lugares ocupados: 1º, 2º, 2º, 4º.
export function asignarPuestos(puntosPorJugador: Map<number, number>): Map<number, number> {
  const ordenados = [...puntosPorJugador].sort(([, a], [, b]) => b - a);
  const puestos = new Map<number, number>();

  ordenados.forEach(([jugadorId, puntos], i) => {
    const anterior = ordenados[i - 1];
    const empata = anterior !== undefined && anterior[1] === puntos;
    puestos.set(jugadorId, empata ? puestos.get(anterior[0])! : i + 1);
  });
  return puestos;
}
