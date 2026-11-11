import type { TorneoEnVivo } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: las zonas y el calendario del torneo para cualquiera con el enlace (F10).
// Se vuelve a pedir cada minuto: abierta en el club o proyectada, nadie la recarga. Con la pestaña
// oculta no pide nada.
export function useTorneoEnVivo(slug: string, torneoId: string) {
  return useQuery({
    queryKey: ['torneo-en-vivo', slug, torneoId],
    queryFn: () => pedir<TorneoEnVivo>('GET', `/api/publico/${slug}/torneos/${torneoId}/en-vivo`),
    retry: false,
    refetchInterval: 60_000,
  });
}
