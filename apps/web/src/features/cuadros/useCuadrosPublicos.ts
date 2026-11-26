import type { Cuadros } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Sin login: la ruta es pública y no hace falta sesión (F10).
// Se vuelve a pedir cada minuto, como el torneo en vivo: con la pestaña oculta no pide nada.
export function useCuadrosPublicos(slug: string, torneoId: string) {
  return useQuery({
    queryKey: ['cuadros-publicos', slug, torneoId],
    queryFn: () => pedir<Cuadros>('GET', `/api/publico/${slug}/torneos/${torneoId}/cuadros`),
    retry: false,
    refetchInterval: 60_000,
  });
}
