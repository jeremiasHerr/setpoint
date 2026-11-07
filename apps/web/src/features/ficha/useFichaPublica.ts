import type { FichaDelJugador } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: la ficha del jugador para cualquiera con el enlace (F17).
export function useFichaPublica(slug: string, jugadorId: string) {
  return useQuery({
    queryKey: ['ficha-publica', slug, jugadorId],
    queryFn: () => pedir<FichaDelJugador>('GET', `/api/publico/${slug}/jugadores/${jugadorId}`),
    retry: false,
  });
}
