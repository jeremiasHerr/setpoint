import type { CaraACara } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// El historial entre el jugador y un rival (F18). Es la ruta pública de la web: sin login, y la
// misma que usa la ficha (decisión 122).
export function useCaraACara(rivalId: number) {
  const { perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const jugadorId = perfil?.jugador.id;

  return useQuery({
    queryKey: ['cara-a-cara', slug, jugadorId, rivalId],
    queryFn: () => pedir<CaraACara>('GET', `/api/publico/${slug}/jugadores/${jugadorId}/cara-a-cara/${rivalId}`),
    enabled: slug !== '' && jugadorId !== undefined && Number.isInteger(rivalId),
    retry: 1,
  });
}
