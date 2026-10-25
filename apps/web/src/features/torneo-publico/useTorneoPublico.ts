import type { TorneoPublico } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: es el link del torneo que la organización comparte en el grupo (F12).
export function useTorneoPublico(slug: string, torneoId: string) {
  return useQuery({
    queryKey: ['torneo-publico', slug, torneoId],
    queryFn: () => pedir<TorneoPublico>('GET', `/api/publico/${slug}/torneos/${torneoId}`),
    retry: false,
  });
}
