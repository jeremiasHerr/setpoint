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
});

export type ConfiguracionCircuito = z.infer<typeof configuracionCircuitoSchema>;

// Lo que devuelve el GET: la configuración más datos que no se editan desde esta pantalla.
export type Circuito = ConfiguracionCircuito & {
  slug: string;
  jugadores: number;
};
