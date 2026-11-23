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
  // Para el link que se copia, con el nombre del torneo (decisión 140).
  slugPublico: string | null;
  // La que abre el engranaje, mientras se pueda editar (decisión 101).
  convocatoriaId: number;
  sePuedeEditar: boolean;
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
export type Aviso = { tipo: 'partidos-vencidos'; torneoId: number; categoria: string; partidos: number };

// Una categoría con la inscripción abierta que cierra pronto y todavía no tiene los pagos para
// sortear las zonas (decisión 125). No venció nada: va aparte de «Necesita tu atención», sin rojo.
export type PocosInscriptos = {
  torneoId: number;
  slugPublico: string | null;
  nombre: string;
  pagaron: number;
  minimo: number;
  // 0 si cierra hoy.
  diasParaElCierre: number;
};

export type TorneosDeInicio = {
  borradores: TorneoEnBorrador[];
  enJuego: TorneoEnJuego[];
  conInscripcionAbierta: TorneoConInscripcionAbierta[];
  paraSortear: TorneoParaSortear[];
  // Todos, del último que terminó al primero. La columna muestra los últimos y despliega el resto.
  terminados: TorneoTerminado[];
  avisos: Aviso[];
  pocosInscriptos: PocosInscriptos[];
  organizacion: string;
  jugadores: number;
  categorias: number;
  recaudadoEnInscripcionesAbiertas: number;
  usaRanking: boolean;
};
