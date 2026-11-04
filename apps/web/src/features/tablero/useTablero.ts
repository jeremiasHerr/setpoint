import type { DatosFechaAcordadaEntrada } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { anotarFecha, cerrarZonas, obtenerCoordinacion, obtenerTablero } from './api';

const claveTablero = (slug: string, id: number) => ['tablero', slug, id];

export function useTablero(slug: string, id: number) {
  return useQuery({
    queryKey: claveTablero(slug, id),
    queryFn: () => obtenerTablero(slug, id),
    retry: false,
  });
}

export function useCerrarZonas(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cerrarZonas(slug, id),
    // Con las zonas cerradas, el tablero pasa a mostrar los cuadros.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: claveTablero(slug, id) }),
  });
}

// Se pide al abrir "Anotar fecha" en una fila de "Lo que falta".
export function useCoordinacion(slug: string, id: number, partidoId: number) {
  return useQuery({
    queryKey: ['coordinacion', slug, id, partidoId],
    queryFn: () => obtenerCoordinacion(slug, id, partidoId),
    retry: false,
  });
}

export function useAnotarFecha(slug: string, id: number, partidoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosFechaAcordadaEntrada) => anotarFecha(slug, id, partidoId, datos),
    // Con fecha, el partido deja de estar sin coordinar.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: claveTablero(slug, id) }),
  });
}
