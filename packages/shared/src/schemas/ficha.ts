// La ficha pública del jugador (F17): docs/pantallas/publico/ficha-y-cara-a-cara.html. La arma la
// API con sus partidos y sus movimientos de ranking; la web solo la muestra. Como toda pantalla
// pública, sin teléfono ni email.
import type { Instancia } from './circuito';
import type { ClaveCuadro, JugadorDelCuadro } from './cuadros';
import type { Casillero, TorneoDelCalendario } from './ranking';

// Hasta dónde llegó en un torneo, calculado con sus partidos (decisión 072). Sirve igual para los
// torneos sin ranking y para los que se están jugando.
export type InstanciaDeLaFicha =
  // Sin partidos de cuadro: la zona se está jugando, o terminó y no pasó a ningún cuadro.
  | { tipo: 'zona'; enJuego: boolean }
  // Su último partido de cuadro. Con enJuego, todavía no se jugó; si no, ahí perdió o salió campeón.
  | { tipo: 'cuadro'; cuadro: ClaveCuadro; ronda: number; rondas: number; campeon: boolean; enJuego: boolean };

export type TorneoDeLaFicha = {
  torneoId: number;
  // "Primavera 26"
  nombre: string;
  categoria: string;
  instancia: InstanciaDeLaFicha;
  // Los que le dio el cierre (F16). null si el torneo no da puntos o todavía no cerró.
  puntos: number | null;
};

export type PartidoDeLaFicha = {
  id: number;
  torneoId: number;
  // "Primavera 26"
  torneo: string;
  // En la zona, la letra; en un cuadro, el cuadro, la ronda y cuántas tiene, para nombrarla.
  grupo: string | null;
  cuadro: ClaveCuadro | null;
  ronda: number | null;
  rondas: number | null;
  rival: JugadorDelCuadro;
  gano: boolean;
  estado: 'jugada' | 'walkover' | 'abandono';
  // Desde su lado: "6-3 4-6 10-7", "W.O." o "ab." (el W.O. y el abandono no guardan sets).
  marcador: string;
};

// El W.O. no cuenta en jugados, ganados ni perdidos; el abandono sí (decisión 073). Los W.O. se
// cuentan aparte, para decir por qué la lista tiene más partidos que los jugados.
export type RecordDelJugador = {
  jugados: number;
  ganados: number;
  perdidos: number;
  walkovers: number;
};

// Un casillero vigente con la instancia que lo dio. Los importados de la planilla no la tienen.
export type CasilleroDeLaFicha = Casillero & { instancia: Instancia | null };

export type RankingDeLaFicha = {
  puesto: number;
  puntos: number;
  torneosDelCalendario: TorneoDelCalendario[];
  // Solo los casilleros con puntos, como en el ranking público.
  casilleros: CasilleroDeLaFicha[];
};

export type FichaDelJugador = {
  organizacion: string;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // La categoría en la que juega hoy. El ranking es el de esa categoría (F09).
  categoria: string | null;
  record: RecordDelJugador;
  // null si la organización no lleva ranking o el jugador no tiene categoría.
  ranking: RankingDeLaFicha | null;
  // Del más reciente al más viejo, de todas sus categorías.
  torneos: TorneoDeLaFicha[];
  // Solo los que tienen resultado, del más reciente al más viejo.
  partidos: PartidoDeLaFicha[];
};
