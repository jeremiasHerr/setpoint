// Los 48 partidos del circuito de ejemplo, zona por zona. El demo y la hoja "Cada uno ve lo que necesita"
// dibujan los mismos números.
export type Zona = {
  letra: string;
  jugados: number;
  conFecha: number;
  sinCoordinar: number;
  vencidos: number;
};

export const ZONAS: Zona[] = [
  { letra: 'A', jugados: 3, conFecha: 1, sinCoordinar: 2, vencidos: 0 },
  { letra: 'B', jugados: 5, conFecha: 1, sinCoordinar: 0, vencidos: 0 },
  { letra: 'C', jugados: 4, conFecha: 1, sinCoordinar: 1, vencidos: 0 },
  { letra: 'D', jugados: 3, conFecha: 1, sinCoordinar: 1, vencidos: 1 },
  { letra: 'E', jugados: 6, conFecha: 0, sinCoordinar: 0, vencidos: 0 },
  { letra: 'F', jugados: 4, conFecha: 2, sinCoordinar: 0, vencidos: 0 },
  { letra: 'G', jugados: 2, conFecha: 2, sinCoordinar: 2, vencidos: 0 },
  { letra: 'H', jugados: 4, conFecha: 1, sinCoordinar: 1, vencidos: 0 },
];

export type FilaDeFalta = { zona: string; partido: string };

// Lo que falta en el Tablero: un vencido y los primeros sin coordinar.
export const FILA_VENCIDA: FilaDeFalta = { zona: 'D', partido: 'Curihual – Nieva' };
export const FILAS_SIN_COORDINAR: FilaDeFalta[] = [
  { zona: 'A', partido: 'Roa – Peralta' },
  { zona: 'A', partido: 'Roa – Vidal' },
  { zona: 'C', partido: 'Ojeda – Riquelme' },
  { zona: 'D', partido: 'Toledo – Bravo' },
  { zona: 'G', partido: 'Lagos – Fuentes' },
  { zona: 'G', partido: 'Bustos – Fuentes' },
  { zona: 'H', partido: 'Mansilla – Painemil' },
];

// Cargar resultado: los chips de zona con la cantidad de partidos que faltan, y los partidos de las
// dos zonas que se ven. `gano` es null si falta.
export const CHIPS_DE_ZONA: { letra: string; faltan?: number }[] = [
  { letra: 'A', faltan: 3 },
  { letra: 'B', faltan: 1 },
  { letra: 'C', faltan: 2 },
  { letra: 'D', faltan: 3 },
  { letra: 'E' },
  { letra: 'F', faltan: 2 },
  { letra: 'G', faltan: 4 },
  { letra: 'H', faltan: 2 },
];

export type PartidoDeZona = { partido: string; gano: string | null };

export const PARTIDOS_DE_A: PartidoDeZona[] = [
  { partido: 'Roa · Peralta', gano: null },
  { partido: 'Roa · Vidal', gano: null },
  { partido: 'Vidal · Cárdenas', gano: null },
  { partido: 'Peralta · Cárdenas', gano: 'Peralta' },
  { partido: 'Roa · Cárdenas', gano: 'Roa' },
  { partido: 'Peralta · Vidal', gano: 'Vidal' },
];

export const PARTIDOS_DE_G: PartidoDeZona[] = [
  { partido: 'Bustos · Millán', gano: null },
  { partido: 'Lagos · Millán', gano: null },
  { partido: 'Lagos · Fuentes', gano: null },
  { partido: 'Bustos · Fuentes', gano: null },
  { partido: 'Bustos · Lagos', gano: 'Bustos' },
  { partido: 'Millán · Fuentes', gano: 'Millán' },
];
