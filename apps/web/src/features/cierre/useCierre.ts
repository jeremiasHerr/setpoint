import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cerrarTorneo, obtenerCierre } from './api';

const claveCierre = (slug: string, id: number) => ['cierre', slug, id];

export function useCierre(slug: string, id: number) {
  return useQuery({
    queryKey: claveCierre(slug, id),
    queryFn: () => obtenerCierre(slug, id),
    retry: false,
  });
}

export function useCerrarTorneo(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cerrarTorneo(slug, id),
    // La respuesta es la vista ya cerrada, con los puntos que se guardaron.
    onSuccess: (cierre) => queryClient.setQueryData(claveCierre(slug, id), cierre),
  });
}
