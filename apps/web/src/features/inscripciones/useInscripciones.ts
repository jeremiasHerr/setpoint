import type { DatosInscripcionManual, InscripcionesDelTorneo } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  aprobarSolicitud,
  cerrarInscripcion,
  darDeBaja,
  inscribirAMano,
  marcarDevolucion,
  obtenerInscripciones,
  recordarPago,
  rechazarSolicitud,
} from './api';
import { claveNavegacion } from '../torneos/useNavegacionDelTorneo';

const claveInscripciones = (slug: string, id: number) => ['inscripciones', slug, id];

export function useInscripciones(slug: string, id: number) {
  return useQuery({
    queryKey: claveInscripciones(slug, id),
    queryFn: () => obtenerInscripciones(slug, id),
    retry: false,
  });
}

export function useCerrarInscripcion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cerrarInscripcion(slug, id),
    onSuccess: (inscripciones) => {
      // Devuelve las inscripciones como quedaron: se guardan directo en la caché.
      queryClient.setQueryData(claveInscripciones(slug, id), inscripciones);
      // El torneo cambió de estado: el inicio y el sorteo tienen que enterarse.
      void queryClient.invalidateQueries({ queryKey: ['torneos', slug] });
      void queryClient.invalidateQueries({ queryKey: ['sorteo', slug, id] });
      void queryClient.invalidateQueries({ queryKey: claveNavegacion(slug, id) });
    },
    // Si falló, puede que otro la haya cerrado o que haya cambiado quién pagó: se vuelve a pedir.
    onError: () => void queryClient.invalidateQueries({ queryKey: claveInscripciones(slug, id) }),
  });
}

// Aprobar y rechazar una solicitud de un torneo con aprobación (decisión 054). La variable es el id
// de la inscripción, para saber en qué fila está el pedido.
function useResolverSolicitud(
  slug: string,
  id: number,
  resolver: (slug: string, id: number, inscripcionId: number) => Promise<InscripcionesDelTorneo>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inscripcionId: number) => resolver(slug, id, inscripcionId),
    onSuccess: (inscripciones) => queryClient.setQueryData(claveInscripciones(slug, id), inscripciones),
    // Otra pestaña pudo haberla resuelto, o se cerró la inscripción: se vuelve a pedir.
    onError: () => void queryClient.invalidateQueries({ queryKey: claveInscripciones(slug, id) }),
  });
}

export function useAprobarSolicitud(slug: string, id: number) {
  return useResolverSolicitud(slug, id, aprobarSolicitud);
}

export function useRechazarSolicitud(slug: string, id: number) {
  return useResolverSolicitud(slug, id, rechazarSolicitud);
}

// Las acciones de F13 completa. Cada una devuelve las inscripciones como quedaron, y quiénes
// pagaron cambia el sorteo (decisión 014): se le avisa.
function useAccion<V>(slug: string, id: number, accion: (variables: V) => Promise<InscripcionesDelTorneo>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accion,
    onSuccess: (inscripciones) => {
      queryClient.setQueryData(claveInscripciones(slug, id), inscripciones);
      void queryClient.invalidateQueries({ queryKey: ['sorteo', slug, id] });
    },
    // Otra pestaña pudo haber cambiado algo, o se confirmó el sorteo: se vuelve a pedir.
    onError: () => void queryClient.invalidateQueries({ queryKey: claveInscripciones(slug, id) }),
  });
}

export function useDarDeBaja(slug: string, id: number) {
  return useAccion(slug, id, ({ inscripcionId, devolucion }: { inscripcionId: number; devolucion: boolean }) =>
    darDeBaja(slug, id, inscripcionId, { devolucion }),
  );
}

export function useMarcarDevolucion(slug: string, id: number) {
  return useAccion(slug, id, (inscripcionId: number) => marcarDevolucion(slug, id, inscripcionId));
}

export function useRecordarPago(slug: string, id: number) {
  return useAccion(slug, id, (inscripcionId: number) => recordarPago(slug, id, inscripcionId));
}

export function useInscribirAMano(slug: string, id: number) {
  return useAccion(slug, id, (datos: DatosInscripcionManual) => inscribirAMano(slug, id, datos));
}
