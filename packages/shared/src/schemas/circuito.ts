import { z } from 'zod';

// Instancias que muestra la tabla de puntos, en orden. Las claves son las del contrato;
// la API las traduce al enum Instancia de Prisma.
export const instancias = [
  { clave: 'campeon', etiqueta: 'Campeón' },
  { clave: 'finalista', etiqueta: 'Finalista' },
  { clave: 'semifinalista', etiqueta: 'Semifinalista' },
  { clave: 'cuartos', etiqueta: 'Cuartos de final' },
  { clave: 'octavos', etiqueta: 'Octavos de final' },
  { clave: 'participacion', etiqueta: 'Participación' },
] as const;

export type Instancia = (typeof instancias)[number]['clave'];

const puntosDeInstancia = z
  .number({ error: 'Tiene que ser un número' })
  .int('Tiene que ser un número entero')
  .min(0, 'No puede ser negativo')
  .max(10000, 'Como máximo 10.000');

// Lista ordenada de nombres únicos: la posición define el orden (de etapas, del calendario).
const listaDeNombres = (queEs: string) =>
  z
    .array(z.string().trim().min(1).max(40))
    .max(30)
    .refine(
      (nombres) => new Set(nombres.map((n) => n.toLowerCase())).size === nombres.length,
      `Hay ${queEs} repetidas`,
    );

// Superficies de cancha, en el orden en que se ofrecen. Las claves son las del enum de Prisma en minúscula.
export const superficies = [
  { clave: 'polvo_ladrillo', etiqueta: 'Polvo de ladrillo' },
  { clave: 'cemento', etiqueta: 'Cemento' },
  { clave: 'sintetico', etiqueta: 'Sintético' },
  { clave: 'carpeta', etiqueta: 'Carpeta' },
  { clave: 'otra', etiqueta: 'Otra' },
] as const;

export type Superficie = (typeof superficies)[number]['clave'];

const sinRepetidos = (filas: { nombre: string }[]) =>
  new Set(filas.map((f) => f.nombre.toLowerCase())).size === filas.length;

// El id llega cuando la fila ya existe: permite cambiarle el nombre sin perder lo que apunta a ella.
// Sin id es una fila nueva (ver docs/decisiones/005-clubes-en-la-configuracion-del-circuito.md).
const idExistente = z.number().int().positive().optional();

const canchaSchema = z.object({
  id: idExistente,
  nombre: z.string().trim().min(1, 'Escribí el nombre de la cancha').max(40),
  superficie: z.enum(['polvo_ladrillo', 'cemento', 'sintetico', 'carpeta', 'otra']),
});

const clubSchema = z.object({
  id: idExistente,
  nombre: z.string().trim().min(1, 'Escribí el nombre del club').max(80),
  direccion: z.string().trim().max(120).default(''),
  canchas: z.array(canchaSchema).max(30).refine(sinRepetidos, 'Hay canchas repetidas').default([]),
});

export type Club = z.infer<typeof clubSchema>;
export type Cancha = z.infer<typeof canchaSchema>;

export const configuracionCircuitoSchema = z.object({
  nombre: z.string({ error: 'Escribí el nombre del circuito' }).trim().min(2, 'Escribí el nombre del circuito').max(80),
  contacto: z.string().trim().max(200),
  usaRanking: z.boolean(),
  categorias: listaDeNombres('categorías'),
  etapas: listaDeNombres('etapas'),
  puntos: z.object({
    campeon: puntosDeInstancia,
    finalista: puntosDeInstancia,
    semifinalista: puntosDeInstancia,
    cuartos: puntosDeInstancia,
    octavos: puntosDeInstancia,
    participacion: puntosDeInstancia,
  }),
  // Opcionales: sin clubes, la sede de cada partido se escribe a mano (07-configurabilidad §2.4).
  clubes: z.array(clubSchema).max(30).refine(sinRepetidos, 'Hay clubes repetidos').default([]),
});

export type ConfiguracionCircuito = z.infer<typeof configuracionCircuitoSchema>;

// Lo que devuelve el GET: la configuración más datos que no se editan desde esta pantalla.
export type Circuito = ConfiguracionCircuito & {
  slug: string;
  jugadores: number;
};
