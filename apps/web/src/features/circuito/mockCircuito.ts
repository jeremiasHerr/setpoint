// Datos de ejemplo mientras no exista el endpoint. Los tipos pasan a packages/shared al conectar la API.

export const instancias = [
  { clave: 'campeon', etiqueta: 'Campeón' },
  { clave: 'finalista', etiqueta: 'Finalista' },
  { clave: 'semifinalista', etiqueta: 'Semifinalista' },
  { clave: 'cuartos', etiqueta: 'Cuartos de final' },
  { clave: 'octavos', etiqueta: 'Octavos de final' },
  { clave: 'participacion', etiqueta: 'Participación' },
] as const;

export type Instancia = (typeof instancias)[number]['clave'];

export type ConfiguracionCircuito = {
  nombre: string;
  slug: string;
  contacto: string;
  usaRanking: boolean;
  categorias: string[];
  etapas: string[];
  puntos: Record<Instancia, number>;
  usaClubes: boolean;
};

export const circuitoEjemplo: ConfiguracionCircuito = {
  nombre: 'Polenta Team Tenis',
  slug: 'polenta',
  contacto: '',
  usaRanking: true,
  categorias: ['Segunda', 'Tercera'],
  etapas: ['Primavera', 'Verano', 'Pretemporada', 'Otoño', 'Invierno'],
  puntos: {
    campeon: 100,
    finalista: 75,
    semifinalista: 50,
    cuartos: 25,
    octavos: 15,
    participacion: 10,
  },
  usaClubes: false,
};

export const jugadoresEnPadronEjemplo = 77;
