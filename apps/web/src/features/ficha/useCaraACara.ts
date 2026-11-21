import type { CaraACara, RivalesDelJugador } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: el cara a cara entre dos jugadores del circuito (F18).
export function useCaraACara(slug: string, jugadorId: string, rivalId: string | undefined) {
  return useQuery({
    queryKey: ['cara-a-cara', slug, jugadorId, rivalId],
    queryFn: () => pedir<CaraACara>('GET', `/api/publico/${slug}/jugadores/${jugadorId}/cara-a-cara/${rivalId}`),
    enabled: rivalId !== undefined,
    retry: false,
  });
}

// Con quiénes tiene partidos con resultado: a quién se puede comparar.
export function useRivales(slug: string, jugadorId: string, habilitado: boolean) {
  return useQuery({
    queryKey: ['rivales', slug, jugadorId],
    queryFn: () => pedir<RivalesDelJugador>('GET', `/api/publico/${slug}/jugadores/${jugadorId}/rivales`),
    enabled: habilitado,
    retry: false,
  });
}
