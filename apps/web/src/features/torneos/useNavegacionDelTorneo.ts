import { useQuery } from '@tanstack/react-query';
import { obtenerNavegacion } from './api';

// La comparten las cinco pantallas del torneo: al pasar de una pestaña a otra, la franja ya está.
// Las acciones que cambian el estado del torneo la invalidan con esta clave.
export const claveNavegacion = (slug: string, id: number) => ['navegacion', slug, id];

export function useNavegacionDelTorneo(slug: string, id: number) {
  return useQuery({
    queryKey: claveNavegacion(slug, id),
    queryFn: () => obtenerNavegacion(slug, id),
    retry: false,
  });
}
