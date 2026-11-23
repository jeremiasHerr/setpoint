import type { DatosExtenderPlazo, DatosFechaAcordadaEntrada, Tablero } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { anotarFecha, cerrarZonas, confirmarResultadoPropuesto, extenderPlazo, obtenerCoordinacion, obtenerTablero, recordarPartido } from './api';
import { claveNavegacion } from '../torneos/useNavegacionDelTorneo';

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
    // Con las zonas cerradas, el tablero pasa a mostrar los cuadros y el torneo, a estar en ellos.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: claveTablero(slug, id) });
      void queryClient.invalidateQueries({ queryKey: claveNavegacion(slug, id) });
    },
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

// Con el resultado confirmado, el partido se jugó: cambian las barras, las tablas y lo que falta.
export function useConfirmarResultadoPropuesto(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partidoId: number) => confirmarResultadoPropuesto(slug, id, partidoId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveTablero(slug, id) });
      void queryClient.invalidateQueries({ queryKey: claveNavegacion(slug, id) });
    },
  });
}

// El tablero vuelve como quedó: con el plazo nuevo, el partido puede dejar de estar vencido.
export function useExtenderPlazo(slug: string, id: number, partidoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosExtenderPlazo) => extenderPlazo(slug, id, partidoId, datos),
    onSuccess: (tablero: Tablero) => queryClient.setQueryData(claveTablero(slug, id), tablero),
  });
}

export function useRecordarPartido(slug: string, id: number, partidoId: number) {
  return useMutation({ mutationFn: () => recordarPartido(slug, id, partidoId) });
}
