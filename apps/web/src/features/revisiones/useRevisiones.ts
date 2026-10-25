import type { CasoDeRevision, ResolverRevision, Revisiones } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Revisar vinculación (decisión 051): los casos de "Para revisar" y cómo se resuelven.

export function useRevisiones(slug: string) {
  return useQuery({
    queryKey: ['revisiones', slug],
    queryFn: () => pedir<Revisiones>('GET', `/api/organizaciones/${slug}/revisiones`),
    retry: false,
  });
}

export function useCasoDeRevision(slug: string, jugadorId: string) {
  return useQuery({
    queryKey: ['revisiones', slug, jugadorId],
    queryFn: () => pedir<CasoDeRevision>('GET', `/api/organizaciones/${slug}/revisiones/${jugadorId}`),
    retry: false,
  });
}

// Resolver cambia el padrón (quién tiene cada perfil) y la lista de casos.
export function useResolverRevision(slug: string, jugadorId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: ResolverRevision) => pedir<Revisiones>('POST', `/api/organizaciones/${slug}/revisiones/${jugadorId}`, datos),
    onSuccess: (revisiones) => {
      queryClient.setQueryData(['revisiones', slug], revisiones);
      void queryClient.invalidateQueries({ queryKey: ['padron', slug] });
    },
  });
}
