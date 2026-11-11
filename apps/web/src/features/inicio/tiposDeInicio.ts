// Los tipos de la pantalla de inicio. Los datos salen de torneosDeInicio.ts.

export type TorneoEnBorrador = {
  id: number;
  nombre: string;
  detalle: string;
};

export type TorneoEnJuego = {
  id: number;
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
  nombre: string;
  detalle: string;
  pagaron: number;
  cupo: number;
};

// Una categoría con la inscripción cerrada que todavía no se sorteó.
export type TorneoParaSortear = {
  id: number;
  nombre: string;
  detalle: string;
  pagaron: number;
  cupo: number;
};

export type TorneoTerminado = {
  id: number;
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

export type TorneosDeInicio = {
  borradores: TorneoEnBorrador[];
  enJuego: TorneoEnJuego[];
  conInscripcionAbierta: TorneoConInscripcionAbierta[];
  paraSortear: TorneoParaSortear[];
  // Todos, del último que terminó al primero. La tabla muestra los últimos y despliega el resto.
  terminados: TorneoTerminado[];
  avisos: Aviso[];
  jugadores: number;
  categorias: number;
  recaudadoEnInscripcionesAbiertas: number;
  usaRanking: boolean;
};
