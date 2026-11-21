// La proyección de un jugador en un torneo que todavía no cerró (F20): cómo queda en el ranking
// según hasta dónde llegue. Es una cuenta exacta, sin modelos (decisión 117). La arma la API; la
// web y la app solo la muestran. Como toda pantalla pública, sin teléfono ni email.
import { z } from 'zod';
import type { InstanciaDeLaFicha } from './ficha';

const instancia = z.enum(['campeon', 'finalista', 'semifinalista', 'cuartos', 'octavos', 'participacion']);

// Cómo llegó el jugador a este punto del torneo; el schema de la ficha es un tipo, no un schema.
const situacion = z.custom<InstanciaDeLaFicha>();

// Un cierre hipotético: con esa instancia, cuántos puntos suma, cómo queda su total y en qué puesto.
export const escenarioDeProyeccionSchema = z.object({
  instancia,
  puntos: z.number().int(),
  acumulado: z.number().int(),
  // null si no figura en el ranking.
  puesto: z.number().int().nullable(),
});

export const proyeccionDelJugadorSchema = z.object({
  organizacion: z.string(),
  torneoId: z.number().int(),
  // "Primavera 26 · Tercera"
  torneo: z.string(),
  torneoDelCalendario: z.string(),
  jugadorId: z.number().int(),
  nombre: z.string(),
  apellido: z.string(),
  // null antes del sorteo.
  situacion: situacion.nullable(),
  hoy: z.object({ puntos: z.number().int(), puesto: z.number().int().nullable() }),
  // Los puntos de su casillero del año pasado, que este torneo reemplaza. null si no tiene.
  defiende: z.object({ puntos: z.number().int(), anio: z.number().int() }).nullable(),
  // Con una sola instancia posible, su torneo ya está definido.
  definido: z.boolean(),
  // De la peor instancia a la mejor.
  escenarios: z.array(escenarioDeProyeccionSchema),
  numeroUno: z.object({
    // La instancia más baja con la que quedaría primero. null si con ninguna.
    desde: instancia.nullable(),
    // El mejor de los demás con lo que ya tiene asegurado. null si no hay otro en la categoría.
    rival: z
      .object({
        jugadorId: z.number().int(),
        nombre: z.string(),
        apellido: z.string(),
        puntos: z.number().int(),
        asegurada: instancia.nullable(),
        sigueEnJuego: z.boolean(),
      })
      .nullable(),
  }),
});

export type EscenarioDeProyeccion = z.infer<typeof escenarioDeProyeccionSchema>;
export type ProyeccionDelJugador = z.infer<typeof proyeccionDelJugadorSchema>;
