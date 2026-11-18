export type EstadoDeMarca = 'hecho' | 'en-curso' | 'pendiente' | 'vencido';

// Los cuatro estados de una marca (design.md §6), los mismos en el tablero, las inscripciones y la
// landing: hecho en noche, en curso en azul (un partido con fecha, un lugar que se está pagando),
// pendiente punteado y vencido en rojo.
export const MARCA: Record<EstadoDeMarca, string> = {
  hecho: 'bg-noche',
  'en-curso': 'bg-azul',
  pendiente: 'outline-[1.5px] outline-offset-[-1.5px] outline-dotted outline-pizarra-500',
  vencido: 'bg-rojo',
};
