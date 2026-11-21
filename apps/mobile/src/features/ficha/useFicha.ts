import type { FichaDelJugador } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// La misma ruta pública que la web (F17): la ficha no pide login. La sesión solo dice de qué circuito.
export function useFicha(slug: string, jugadorId: string) {
  return useQuery({
    queryKey: ['ficha-publica', slug, jugadorId],
    queryFn: () => pedir<FichaDelJugador>('GET', `/api/publico/${slug}/jugadores/${jugadorId}`),
    retry: 1,
  });
}
