import type { Instancia } from './circuito';
import type { ClaveCuadro, EstadoPartido } from './cuadros';

// Cierre del torneo (F16). La API calcula la instancia de cada jugador y, si el torneo da puntos,
// cómo queda el ranking; la web solo lo muestra. Es la misma vista antes y después de cerrar.

export type CampeonDelCuadro = {
  cuadro: ClaveCuadro;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // A quién le ganó la final, y cómo: un W.O. no tiene sets (decisión 016).
  rival: { nombre: string; apellido: string };
  estado: Extract<EstadoPartido, 'jugada' | 'walkover' | 'abandono'>;
  // Desde el lado del campeón: { propios: 6, rival: 4 } es un 6-4 a favor.
  sets: { propios: number; rival: number }[];
};

// Lo que cambia en el ranking de la categoría para un jugador. null en la fila si el torneo no da
// puntos.
export type RankingDelJugador = {
  puntos: number;
  // Los puntos que tenía en el casillero de ese torneo del calendario, que se reemplazan. 0 si no tenía.
  reemplaza: number;
  acumulado: number;
  // null si hoy no está en el ranking de la categoría: se cambió de categoría o se dio de baja.
  puestoAntes: number | null;
  puestoDespues: number | null;
};

export type FilaDelCierre = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  // Hasta dónde llegó. Quien no pasó al cuadro principal, o perdió antes de octavos, es participación.
  instancia: Instancia;
  ranking: RankingDelJugador | null;
};

export type CierreDelTorneo = {
  torneoId: number;
  // "Otoño 2026 · Tercera"
  nombre: string;
  cerrado: boolean;
  // Los partidos con resultado, de las zonas y de los cuadros.
  partidosJugados: number;
  // El torneo del calendario cuyo casillero se reemplaza. null si el torneo no da puntos: es un
  // torneo suelto o la organización no lleva ranking.
  torneoDelCalendario: string | null;
  campeones: CampeonDelCuadro[];
  // De la instancia más alta a la más baja; dentro de cada una, por puesto en el ranking.
  filas: FilaDelCierre[];
  // null si el torneo no da puntos.
  resumen: {
    puntosARepartir: number;
    // Jugadores de la categoría, hayan jugado o no, cuyo puesto cambia con el cierre.
    cambianDePuesto: number;
    // Quién queda primero, y si antes era otro.
    numeroUno: { nombre: string; apellido: string; esNuevo: boolean } | null;
  } | null;
};
