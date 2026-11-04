// El torneo en vivo (F10): las zonas y el calendario de un torneo, para cualquiera con el enlace.
// Los cuadros salen de su propia ruta (ver cuadros.ts). Ninguna pantalla pública muestra datos
// de contacto: los jugadores van sin teléfono ni email.
import type { ClaveCuadro, EstadoPartido, JugadorDelCuadro } from './cuadros';
import type { FilaDePosiciones } from './posiciones';

export type PartidoEnVivo = {
  id: number;
  // En la fase de grupos, la zona; en los cuadros, el cuadro y la ronda.
  grupo: string | null;
  cuadro: ClaveCuadro | null;
  ronda: number | null;
  // null en un partido de cuadro que espera al ganador de la ronda anterior.
  jugadorA: JugadorDelCuadro | null;
  jugadorB: JugadorDelCuadro | null;
  ganadorId: number | null;
  estado: EstadoPartido;
  // Fecha y hora anotadas por los jugadores o la organización (F14), en ISO.
  fechaAcordada: string | null;
  // El club registrado o la sede escrita a mano.
  sede: string | null;
  sets: { gamesA: number; gamesB: number; esSuperTieBreak: boolean }[];
};

export type ZonaEnVivo = {
  grupo: string;
  filas: FilaDePosiciones[];
  partidos: PartidoEnVivo[];
};

export type TorneoEnVivo = {
  torneoId: number;
  // Nombre de la organización, para el encabezado de la página pública.
  organizacion: string;
  // "Primavera 2026 · Tercera"
  nombre: string;
  // La línea de corte: los primeros clasificanPorGrupo van al cuadro principal.
  clasificanPorGrupo: number;
  tieneComplementaria: boolean;
  // Con las zonas cerradas, los cuadros ya están armados.
  hayCuadros: boolean;
  // Rondas de cada cuadro, para nombrar la ronda de un partido ("cuartos", "final").
  rondas: Partial<Record<ClaveCuadro, number>>;
  zonas: ZonaEnVivo[];
  // Los partidos con fecha, del más próximo al más lejano. Los jugados quedan, con su resultado.
  calendario: PartidoEnVivo[];
  // Los que todavía no tienen fecha ni resultado y ya tienen a sus dos jugadores.
  sinFecha: number;
};
