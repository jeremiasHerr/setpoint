import type { Cuadros } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// La misma ruta pública que la página de los cuadros de la web (F10): no pide login. La sesión solo
// dice de qué circuito.
export function useCuadros(slug: string, torneoId: string) {
  return useQuery({
    queryKey: ['cuadros-publicos', slug, torneoId],
    queryFn: () => pedir<Cuadros>('GET', `/api/publico/${slug}/torneos/${torneoId}/cuadros`),
    enabled: slug !== '' && torneoId !== '',
    retry: 1,
  });
}
