import type { FilaDeRanking, TemporadaDeCategoria } from '@setpoint/shared';

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

// El movimiento vigente de cada casillero: por cada jugador y etapa, el más reciente.
// Los movimientos sin etapa (ajustes manuales) no ocupan casillero y no se devuelven. Devuelve los
// mismos objetos que recibe, con todos sus campos: la ficha (F17) lee la instancia de cada uno.
export function casillerosVigentes<M extends MovimientoDeRanking>(movimientos: M[]): M[] {
  const casilleros = new Map<string, M>();
  for (const movimiento of movimientos) {
    if (movimiento.etapaId === null) continue;
    const clave = `${movimiento.jugadorId}:${movimiento.etapaId}`;
    const vigente = casilleros.get(clave);
    if (!vigente || esMasReciente(movimiento, vigente)) casilleros.set(clave, movimiento);
  }
  return [...casilleros.values()];
}

// Puntos vigentes de cada jugador: por cada casillero de etapa vale solo el movimiento
// más reciente, y se suman los casilleros. Los ajustes manuales se suman todos.
// Los movimientos tienen que ser de una sola categoría: cada una tiene su ranking.
export function puntosVigentes(movimientos: MovimientoDeRanking[]): Map<number, number> {
  const puntos = new Map<number, number>();
  const ajustes = movimientos.filter((m) => m.etapaId === null);

  for (const movimiento of [...casillerosVigentes(movimientos), ...ajustes]) {
    puntos.set(movimiento.jugadorId, (puntos.get(movimiento.jugadorId) ?? 0) + movimiento.puntos);
  }
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

export type JugadorDeRanking = { id: number; nombre: string; apellido: string };

// La tabla de una categoría (F09). Los movimientos tienen que ser de esa categoría y de
// esos jugadores. Ordenada por puesto; los empatados, por apellido. El año de cada
// casillero sale de la fecha del movimiento: "Primavera 25".
export function tablaDeCategoria(jugadores: JugadorDeRanking[], movimientos: MovimientoDeRanking[]): FilaDeRanking[] {
  const puntos = puntosVigentes(movimientos);
  const puestos = asignarPuestos(new Map(jugadores.map((j) => [j.id, puntos.get(j.id) ?? 0])));
  const casilleros = casillerosVigentes(movimientos);

  return jugadores
    .map((j) => ({
      jugadorId: j.id,
      puesto: puestos.get(j.id)!,
      nombre: j.nombre,
      apellido: j.apellido,
      puntos: puntos.get(j.id) ?? 0,
      casilleros: casilleros
        .filter((m) => m.jugadorId === j.id && m.puntos > 0)
        .map((m) => ({ etapaId: m.etapaId!, puntos: m.puntos, anio: m.fecha.getUTCFullYear() })),
    }))
    .sort((a, b) => a.puesto - b.puesto || a.apellido.localeCompare(b.apellido, 'es'));
}

// Los estados en los que una edición ya no recibe inscriptos y todavía no cerró: se está jugando.
const JUGANDOSE = ['INSCRIPCIONES_CERRADAS', 'ZONAS_GENERADAS', 'GRUPOS_EN_CURSO', 'ELIMINATORIAS'];

export type TorneoDeLaTemporada = {
  id: number;
  slugPublico: string | null;
  nombre: string;
  estado: string;
  etapaId: number | null;
  fechaInicio: Date | null;
  cierreInscripcion: Date | null;
};

// Lo que pasa en la temporada de una categoría (decisión 159), con sus torneos. En juego, la edición
// de un torneo del calendario que arrancó más tarde: un torneo suelto no cambia ningún casillero.
// Con la inscripción abierta, el que cierra primero, sea del calendario o no.
export function temporadaDeCategoria(torneos: TorneoDeLaTemporada[]): TemporadaDeCategoria {
  const tiempo = (fecha: Date | null) => fecha?.getTime() ?? 0;

  const enJuego = torneos
    .filter((t) => t.etapaId !== null && JUGANDOSE.includes(t.estado))
    .sort((a, b) => tiempo(b.fechaInicio) - tiempo(a.fechaInicio))[0];
  const abierto = torneos
    .filter((t) => t.estado === 'PUBLICADO')
    // Sin fecha de cierre, al final: no se sabe cuándo apura.
    .sort((a, b) => (tiempo(a.cierreInscripcion) || Infinity) - (tiempo(b.cierreInscripcion) || Infinity))[0];

  return {
    enJuego: enJuego ? { nombre: enJuego.nombre, etapaId: enJuego.etapaId! } : null,
    inscripcionAbierta: abierto
      ? {
          id: abierto.id,
          slugPublico: abierto.slugPublico,
          nombre: abierto.nombre,
          cierreInscripcion: abierto.cierreInscripcion?.toISOString().slice(0, 10) ?? null,
        }
      : null,
  };
}
