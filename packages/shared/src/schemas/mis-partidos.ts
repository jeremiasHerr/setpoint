// Cuándo juego, en la app del jugador (F11): docs/pantallas/jugador/cuando-juego.html. Sus
// partidos del torneo en curso, desde su lado: el rival, la fecha, dónde y cómo le fue.
import type { AccionDeFecha, QuienAnoto } from './coordinacion';

export type RivalDelPartido = {
  nombre: string;
  apellido: string;
  // Solo para un partido que todavía no se jugó: es para escribirle y coordinar (decisión 046).
  telefono: string | null;
};

export type PartidoDelJugador = {
  id: number;
  // "zona C", "campeonato · semifinales". Si juega más de un torneo, con el nombre adelante.
  instancia: string;
  // null en un cuadro, mientras no se sabe quién viene de la ronda anterior.
  rival: RivalDelPartido | null;
  // PENDIENTE_COORDINACION, ANOTADA, CONFIRMADA, JUGADA, WALKOVER, ABANDONO...
  estado: string;
  fechaAcordada: string | null;
  fechaLimite: string | null;
  // Quién anotó la fecha que está ahora (F14). Con 'rival' y estado ANOTADA, le toca confirmar.
  anotadaPor: QuienAnoto | null;
  // Qué puede hacer con la fecha desde la app: anotarla, cambiarla o reprogramarla. null si no
  // puede (ya se jugó, venció el plazo, no le quedan reprogramaciones o falta poco).
  accionDeFecha: AccionDeFecha | null;
  // "Club Alta Barda · cancha 3", o lo que se haya escrito como sede.
  sede: string | null;
  // Con resultado: si ganó y el marcador desde su lado, "6-3 4-6 10-7" o "W.O.".
  resultado: { gano: boolean; marcador: string } | null;
};

export type MisPartidos = {
  // Los torneos en juego en los que está: casi siempre uno. Dos, si el siguiente arranca
  // mientras se juegan las eliminatorias del anterior.
  torneos: string[];
  partidos: PartidoDelJugador[];
};

// partidos null: el jugador no está en ningún torneo en juego.
export type RespuestaMisPartidos = { partidos: MisPartidos | null };
