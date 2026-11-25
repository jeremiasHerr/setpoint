// Tablero del torneo (F15): docs/pantallas/organizador/tablero.html. La API calcula en qué
// situación está cada partido y qué falta; la web solo lo muestra.
import { z } from 'zod';
import type { ClaveCuadro, EstadoPartido } from './cuadros';
import type { FilaDePosiciones } from './posiciones';

// Vencido: pasó su fecha límite sin resultado. Se calcula en cada consulta, no se guarda
// (decisión 060). Esperando: un partido de cuadro que todavía no tiene a sus dos jugadores.
// Falta cargar: la fecha acordada ya pasó y no tiene resultado; gana sobre vencido (decisión 151).
export const situacionesDelPartido = ['jugado', 'con_fecha', 'falta_cargar', 'sin_coordinar', 'vencido', 'esperando'] as const;
export type SituacionDelPartido = (typeof situacionesDelPartido)[number];

// El teléfono es para "Escribirles": el tablero es solo para quien administra.
export type JugadorDelTablero = { jugadorId: number; nombre: string; apellido: string; telefono: string | null };

export type PartidoDelTablero = {
  id: number;
  // Un partido de zona tiene grupo; uno de cuadro, cuadro y ronda.
  grupo: string | null;
  cuadro: ClaveCuadro | null;
  ronda: number | null;
  jugadorA: JugadorDelTablero | null;
  jugadorB: JugadorDelTablero | null;
  estado: EstadoPartido;
  situacion: SituacionDelPartido;
  ganadorId: number | null;
  // 'AAAA-MM-DD'. El último día para jugarlo.
  fechaLimite: string | null;
  // Días hasta la fecha límite, contados en Argentina: 0 es hoy, -1 venció ayer. null sin fecha límite.
  dias: number | null;
  // Fecha y hora que anotaron los jugadores (F14), en ISO.
  fechaAcordada: string | null;
  // En un super tie-break, gamesA y gamesB son los puntos. El W.O. y el abandono no tienen sets.
  sets: { gamesA: number; gamesB: number; esSuperTieBreak: boolean }[];
  // El resultado que cargó un jugador desde la app y todavía no cuenta (decisión 127): pendiente de
  // que lo confirme el rival, o rechazado. La organización lo puede confirmar ella.
  resultadoPropuesto: ResultadoPropuestoDelTablero | null;
};

export type ResultadoPropuestoDelTablero = {
  // El que lo cargó: 'a' o 'b' del partido.
  cargadoPor: 'a' | 'b';
  estado: 'pendiente' | 'rechazado';
  ganador: 'a' | 'b';
  // Desde el lado del jugador A, como los sets: "6-3 6-4" o "ab.".
  marcador: string;
};

// Un grupo de partidos para las barras del tablero: una zona ("A"), o una ronda de un cuadro.
export type BloqueDelTablero = {
  clave: string;
  grupo: string | null;
  cuadro: ClaveCuadro | null;
  ronda: number | null;
  partidos: PartidoDelTablero[];
};

export type ZonaDelTablero = {
  grupo: string;
  filas: FilaDePosiciones[];
  partidos: PartidoDelTablero[];
};

export type Tablero = {
  torneoId: number;
  // "Primavera 2026 · Tercera"
  nombre: string;
  // Cómo llama la organización a su cuadro consuelo (07 §1.2).
  nombreCuadroConsuelo: string;
  // grupos: zonas en juego. cuadros: zonas cerradas, cuadros en juego. terminado: torneo cerrado.
  fase: 'grupos' | 'cuadros' | 'terminado';
  clasificanPorGrupo: number;
  tieneComplementaria: boolean;
  // Rondas de cada cuadro, para nombrarlas ("semis"). Vacío antes de cerrar las zonas.
  rondas: Partial<Record<ClaveCuadro, number>>;
  // El plazo que corre: el de la fase de grupos, o el de la ronda de cuadro más atrasada.
  // null si no hay nada pendiente o el torneo no tiene plazo cargado.
  plazo: { fechaLimite: string; dias: number } | null;
  // De la fase que se muestra: los de zona en grupos, los de cuadro en cuadros. Sin cancelados.
  totales: { partidos: number; jugados: number; conFecha: number; faltaCargar: number; sinCoordinar: number; vencidos: number };
  bloques: BloqueDelTablero[];
  // Lo que falta, ordenado por urgencia: los vencidos y los sin coordinar, del plazo más viejo al
  // más nuevo. Los que tienen fecha se cuentan en totales.conFecha.
  vencidos: PartidoDelTablero[];
  // Con la fecha acordada ya pasada y sin resultado, del más viejo al más reciente (decisión 151).
  faltaCargar: PartidoDelTablero[];
  sinCoordinar: PartidoDelTablero[];
  // Las zonas con su tabla y sus partidos. Vacío fuera de la fase de grupos.
  zonas: ZonaDelTablero[];
  // Con todos los partidos de zona resueltos se pueden cerrar las zonas (decisión 026); con los de
  // los cuadros, el torneo (F16).
  sePuedenCerrarLasZonas: boolean;
  sePuedeCerrarElTorneo: boolean;
};

// Extender el plazo de un partido desde el tablero (decisión 135): el último día nuevo para jugarlo.
export const extenderPlazoSchema = z.object({
  fechaLimite: z.string().regex(/^d{4}-d{2}-d{2}$/, 'Elegí una fecha'),
});
export type DatosExtenderPlazo = z.infer<typeof extenderPlazoSchema>;

// A quién le llegó "Recordarles" (decisión 135): por aviso al celular, por email, o a nadie. Son
// apellidos, para decirlo en la fila del partido.
export type RecordatorioEnviado = {
  conAviso: string[];
  conEmail: string[];
  sinCanal: string[];
};
