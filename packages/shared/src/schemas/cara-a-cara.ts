// El cara a cara entre dos jugadores (F18): docs/pantallas/publico/ficha-y-cara-a-cara.html. La arma
// la API con los partidos que jugaron entre ellos; la web y la app solo la muestran. Como toda
// pantalla pública, sin teléfono ni email.
import { z } from 'zod';
import type { ClaveCuadro } from './cuadros';
import type { PartidoDeLaFicha } from './ficha';

// Los dos jugadores van en la ruta: /jugadores/:id/cara-a-cara/:rivalId. Uno contra sí mismo no tiene
// historial.
export const caraACaraParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    rivalId: z.coerce.number().int().positive(),
  })
  .refine((p) => p.id !== p.rivalId, { message: 'Elegí a otro jugador' });

export type JugadorDelCaraACara = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  categoria: string | null;
  // Su puesto y sus puntos en la categoría en la que juega hoy. null si la organización no lleva ranking.
  puesto: number | null;
  puntos: number | null;
};

// El W.O. no cuenta como jugado; el abandono sí (decisión 073). Los W.O. se cuentan aparte.
export type ResumenDelCaraACara = {
  jugados: number;
  ganadosA: number;
  ganadosB: number;
  walkovers: number;
};

export type PartidoDelCaraACara = Pick<PartidoDeLaFicha, 'id' | 'torneoId' | 'torneo' | 'grupo' | 'ronda' | 'rondas' | 'estado'> & {
  cuadro: ClaveCuadro | null;
  // Quién ganó: 'a' es el jugador de la ruta (:id); 'b', el rival.
  ganador: 'a' | 'b';
  // Desde el lado de A: "6-3 4-6 10-7", "W.O." o "ab.".
  marcador: string;
};

export type CaraACara = {
  organizacion: string;
  // Cómo llama la organización a su cuadro consuelo (07 §1.2).
  nombreCuadroConsuelo: string;
  a: JugadorDelCaraACara;
  b: JugadorDelCaraACara;
  resumen: ResumenDelCaraACara;
  // Del más reciente al más viejo, solo los que tienen resultado.
  partidos: PartidoDelCaraACara[];
};

// Los rivales con los que el jugador tiene partidos con resultado: a quién se puede comparar.
export type RivalDelJugador = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  categoria: string | null;
  partidos: number;
};

export type RivalesDelJugador = {
  organizacion: string;
  jugadorId: number;
  nombre: string;
  apellido: string;
  rivales: RivalDelJugador[];
};
