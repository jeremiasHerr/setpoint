import { z } from 'zod';
import type { CuentaMercadoPago } from './pago';

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
const listaDeNombres = (siHayRepetidos: string) =>
  z
    .array(z.string().trim().min(1).max(40))
    .max(30)
    .refine(
      (nombres) => new Set(nombres.map((n) => n.toLowerCase())).size === nombres.length,
      siHayRepetidos,
    );

// Superficies de cancha, en el orden en que se ofrecen. Las claves son las del enum de Prisma en minúscula.
// `corta` es la que va dentro de una frase o en un filtro: "Invierno 26 · semifinal · polvo".
export const superficies = [
  { clave: 'polvo_ladrillo', etiqueta: 'Polvo de ladrillo', corta: 'polvo' },
  { clave: 'cemento', etiqueta: 'Cemento', corta: 'cemento' },
  { clave: 'sintetico', etiqueta: 'Sintético', corta: 'sintético' },
  { clave: 'carpeta', etiqueta: 'Carpeta', corta: 'carpeta' },
  { clave: 'otra', etiqueta: 'Otra', corta: 'otra superficie' },
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

// A quién escribirle (decisión 091). El WhatsApp se abre como chat en las páginas públicas.
export const tiposContacto = ['whatsapp', 'red_social'] as const;

export const contactoSchema = z.object({
  tipo: z.enum(tiposContacto),
  valor: z.string({ error: 'Escribí el contacto' }).trim().min(1, 'Escribí el contacto').max(100),
});

export type Contacto = z.infer<typeof contactoSchema>;

// Cómo se llama el cuadro de los que no clasifican al principal si la organización no lo cambia.
export const NOMBRE_CUADRO_CONSUELO = 'Cuadro consuelo';

// El nombre que se muestra: el de la organización o el de por defecto.
export const nombreCuadroConsuelo = (guardado: string | null | undefined) => guardado?.trim() || NOMBRE_CUADRO_CONSUELO;

export const configuracionCircuitoSchema = z.object({
  nombre: z.string({ error: 'Escribí el nombre del circuito' }).trim().min(2, 'Escribí el nombre del circuito').max(80),
  contactos: z.array(contactoSchema).max(10, 'Como máximo 10 contactos').default([]),
  // Vacío vuelve al nombre por defecto.
  nombreCuadroConsuelo: z
    .string()
    .trim()
    .max(40, 'Como máximo 40 caracteres')
    .nullish()
    .transform((v) => v || null),
  usaRanking: z.boolean(),
  // Si los jugadores pueden cargar sus resultados desde la app, con la confirmación del rival
  // (decisión 127). Apagado, los carga solo la organización, como en POLENTA. Sin el campo, queda
  // como estaba.
  jugadoresCarganResultados: z.boolean().optional(),
  categorias: listaDeNombres('Hay categorías repetidas'),
  etapas: listaDeNombres('Hay torneos del calendario repetidos'),
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
  // Se conecta y se desconecta con sus propias rutas, no con el PUT del circuito.
  mercadopago: CuentaMercadoPago;
};
