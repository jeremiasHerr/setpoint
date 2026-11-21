import type { ProyeccionDelJugador } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: qué tiene en juego un jugador en un torneo (F20), para cualquiera con el enlace.
export function useProyeccion(slug: string, torneoId: string, jugadorId: string) {
  return useQuery({
    queryKey: ['proyeccion', slug, torneoId, jugadorId],
    queryFn: () => pedir<ProyeccionDelJugador>('GET', `/api/publico/${slug}/torneos/${torneoId}/proyeccion/${jugadorId}`),
    retry: false,
  });
}
