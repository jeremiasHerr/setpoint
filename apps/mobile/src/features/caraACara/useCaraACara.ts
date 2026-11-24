import type { CaraACara, RivalesDelJugador } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// El historial entre dos jugadores (F18). Sin jugadorId, el primero es quien tiene la sesión: es
// "Cómo te fue con él". Con jugadorId, se comparan dos del circuito desde una ficha (decisión 143).
// Es la ruta pública de la web: sin login, y la misma que usa la ficha (decisión 122).
export function useCaraACara(rivalId: number, jugadorId?: number) {
  const { perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const de = jugadorId ?? perfil?.jugador.id;

  return useQuery({
    queryKey: ['cara-a-cara', slug, de, rivalId],
    queryFn: () => pedir<CaraACara>('GET', `/api/publico/${slug}/jugadores/${de}/cara-a-cara/${rivalId}`),
    enabled: slug !== '' && de !== undefined && Number.isInteger(rivalId),
    retry: 1,
  });
}

// Con quiénes jugó un jugador: a quién se lo puede comparar (decisión 143).
export function useRivales(jugadorId: number) {
  const { perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';

  return useQuery({
    queryKey: ['rivales', slug, jugadorId],
    queryFn: () => pedir<RivalesDelJugador>('GET', `/api/publico/${slug}/jugadores/${jugadorId}/rivales`),
    enabled: slug !== '' && Number.isInteger(jugadorId),
    retry: 1,
  });
}
