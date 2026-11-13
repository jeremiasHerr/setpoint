// Los tipos de la pantalla de inicio. Los datos salen de torneosDeInicio.ts.

// Cada tarjeta lleva arriba a qué pertenece: su torneo del calendario ("primavera"), "torneo suelto"
// o "del circuito" si no tiene casillero en el ranking (decisión 094).

export type TorneoEnBorrador = {
  id: number;
  calendario: string;
  nombre: string;
  detalle: string;
};

export type TorneoEnJuego = {
  id: number;
  calendario: string;
  nombre: string;
  fase: string;
  detalle: string;
  partidosJugados: number;
  partidosTotales: number;
  partidosVencidos: number;
};

// Una categoría con la inscripción abierta. `id` es el del torneo, no el de la convocatoria.
export type TorneoConInscripcionAbierta = {
  id: number;
  calendario: string;
  nombre: string;
  detalle: string;
  pagaron: number;
  cupo: number;
};

// Una categoría con la inscripción cerrada que todavía no se sorteó.
export type TorneoParaSortear = {
  id: number;
  calendario: string;
  nombre: string;
  detalle: string;
  pagaron: number;
  cupo: number;
};

export type TorneoTerminado = {
  id: number;
  calendario: string;
  nombre: string;
  // '05/09/2026'. null si se cerró antes de que se guardara la fecha.
  termino: string | null;
  campeon: string | null;
  jugadores: number;
};

// `torneoId` es el de la categoría: «Resolver» lleva a su tablero.
// El de pocos inscriptos todavía no se calcula.
export type Aviso =
  | { tipo: 'partidos-vencidos'; torneoId: number; categoria: string; partidos: number }
  | { tipo: 'pocos-inscriptos'; torneo: string; pagaron: number; cupo: number; cierraEn: string };

// En qué anda cada torneo del calendario, según su última edición.
export type MomentoDeEtapa = 'sin-edicion' | 'borrador' | 'inscripcion' | 'en-juego' | 'terminado';

export type EtapaDelCircuito = {
  nombre: string;
  // La última edición ("Primavera 26"), o el torneo del calendario solo si todavía no tuvo.
  edicion: string;
  momento: MomentoDeEtapa;
};

export type TorneosDeInicio = {
  borradores: TorneoEnBorrador[];
  enJuego: TorneoEnJuego[];
  conInscripcionAbierta: TorneoConInscripcionAbierta[];
  paraSortear: TorneoParaSortear[];
  // Todos, del último que terminó al primero. La columna muestra los últimos y despliega el resto.
  terminados: TorneoTerminado[];
  avisos: Aviso[];
  organizacion: string;
  // Los torneos del calendario, en su orden. Vacío si el circuito no lleva ranking.
  etapas: EtapaDelCircuito[];
  jugadores: number;
  categorias: number;
  recaudadoEnInscripcionesAbiertas: number;
  usaRanking: boolean;
};
