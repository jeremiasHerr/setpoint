// El guion del demo del hero, como datos: qué pasa y cuándo. El recorrido es el del producto:
// Tablero, Cargar resultado (zona, partido, sets, guardar) y Volver al tablero.

// Cada bandera prende una parte de la pantalla (es lo que antes era una clase del contenedor).
export type Bandera =
  | 'res' // abre Cargar resultado
  | 'zg' // zona G elegida
  | 'bm' // partido Bustos · Millán elegido
  | 'c1' // los sets, de a uno
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5a' // el super tie-break: primero un "1"
  | 'c5' // y después el "10"
  | 'c6'
  | 'gana' // "Gana Bustos"
  | 'resumen' // se abre el resumen
  | 'calc' // "Calculando…"
  | 'previa' // "Al guardar": cómo queda la zona
  | 'guardado'
  | 'cuenta' // 31 pasa a 32
  | 'zona' // la cuenta de la zona G pasa de 2/6 a 3/6
  | 'marca' // la marca de la zona G pasa a jugado
  | 'velado'
  | 'cur' // el cursor se ve
  | 'clic'; // el cursor aprieta

// Lo que el cursor señala o el dedo toca. Cada ventana registra el suyo.
export type Objetivo = 'cargar' | 'zonaG' | 'partido' | 'guardar' | 'volver';

export type CeldaDeSet = 'b1' | 'm1' | 'b2' | 'm2' | 'btb' | 'mtb';

export type Paso = {
  on?: Bandera[];
  off?: Bandera[];
  // El cursor viaja hasta el objetivo en tantos ms (solo en la compu).
  ir?: [Objetivo, number];
  apretar?: Objetivo;
  soltar?: true;
  // Un toque de dedo sobre el objetivo (solo en el celular).
  tocar?: Objetivo;
  // La celda de set con el foco; null lo saca.
  foco?: CeldaDeSet | null;
  // La pantalla de carga baja hasta la grilla (1) o hasta "Al guardar" y los botones (2).
  bajar?: 1 | 2;
  leyenda?: 1 | 2 | 3 | 4;
  // El cursor se aleja y se apaga.
  sale?: true;
  // Vuelve al estado inicial bajo el velo, sin que se note.
  reiniciar?: true;
};

export type Guion = {
  duracion: number;
  // Hasta acá corre la línea de progreso; entre fin y reinicio queda llena.
  fin: number;
  reinicio: number;
  pasos: [ms: number, paso: Paso][];
};

export const ESC: Guion = {
  duracion: 15200,
  fin: 14600,
  reinicio: 14850,
  pasos: [
    [400, { on: ['cur'] }],
    [600, { ir: ['cargar', 900] }],
    [1700, { apretar: 'cargar' }],
    [1820, { soltar: true }],
    [1850, { on: ['res'], leyenda: 2 }],
    [2250, { ir: ['zonaG', 800] }],
    [3150, { apretar: 'zonaG' }],
    [3270, { soltar: true }],
    [3280, { on: ['zg'] }],
    [3550, { ir: ['partido', 650] }],
    [4300, { apretar: 'partido' }],
    [4420, { soltar: true }],
    [4430, { on: ['bm'] }],
    [4550, { bajar: 1 }],
    [5100, { foco: 'b1' }],
    [5350, { on: ['c1'], foco: 'm1' }],
    [5600, { on: ['c2'], foco: 'b2' }],
    [5950, { on: ['c3'], foco: 'm2' }],
    [6200, { on: ['c4'], foco: 'btb' }],
    [6550, { on: ['c5a'] }],
    [6680, { off: ['c5a'], on: ['c5'], foco: 'mtb' }],
    [7000, { on: ['c6', 'gana', 'resumen', 'calc'], foco: null }],
    [7450, { on: ['previa'], leyenda: 3 }],
    [8900, { ir: ['guardar', 700] }],
    [9700, { apretar: 'guardar' }],
    [9820, { soltar: true }],
    [9850, { on: ['guardado'], leyenda: 4 }],
    [10350, { ir: ['volver', 650] }],
    [11200, { apretar: 'volver' }],
    [11320, { soltar: true, off: ['res', 'cur'], sale: true }],
    [11650, { on: ['marca'] }],
    [11800, { on: ['zona'] }],
    [11950, { on: ['cuenta'] }],
    [14600, { on: ['velado'] }],
    [14850, { reiniciar: true }],
    [14900, { off: ['velado'] }],
  ],
};

export const MOV: Guion = {
  duracion: 12000,
  fin: 11400,
  reinicio: 11650,
  pasos: [
    [900, { tocar: 'cargar' }],
    [1020, { soltar: true }],
    [1150, { on: ['res'], leyenda: 2 }],
    [1900, { tocar: 'zonaG' }],
    [2020, { soltar: true }],
    [2030, { on: ['zg'] }],
    [2700, { tocar: 'partido' }],
    [2820, { soltar: true }],
    [2830, { on: ['bm'] }],
    [2950, { bajar: 1 }],
    [3500, { foco: 'b1' }],
    [3700, { on: ['c1'], foco: 'm1' }],
    [3900, { on: ['c2'], foco: 'b2' }],
    [4150, { on: ['c3'], foco: 'm2' }],
    [4350, { on: ['c4'], foco: 'btb' }],
    [4600, { on: ['c5a'] }],
    [4720, { off: ['c5a'], on: ['c5'], foco: 'mtb' }],
    [4950, { on: ['c6', 'gana', 'resumen', 'calc'], foco: null }],
    [5350, { on: ['previa'], leyenda: 3 }],
    [6100, { bajar: 2 }],
    [7600, { tocar: 'guardar' }],
    [7720, { soltar: true }],
    [7730, { on: ['guardado'], leyenda: 4 }],
    [8500, { tocar: 'volver' }],
    [8620, { soltar: true, off: ['res'] }],
    [8900, { on: ['marca', 'zona'] }],
    [9100, { on: ['cuenta'] }],
    [11400, { on: ['velado'] }],
    [11650, { reiniciar: true }],
    [11700, { off: ['velado'] }],
  ],
};

// Con "reducir movimiento" no se anima nada: queda la carga con la vista previa de la zona.
export const BANDERAS_QUIETO: Bandera[] = [
  'res',
  'zg',
  'bm',
  'c1',
  'c2',
  'c3',
  'c4',
  'c5',
  'c6',
  'gana',
  'resumen',
  'calc',
  'previa',
];
