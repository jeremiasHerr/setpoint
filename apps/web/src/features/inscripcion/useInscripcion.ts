import type {
  BusquedaEnElPadron,
  DatosPedirCodigo,
  DatosReservar,
  DatosVerificarCodigo,
  Reserva,
  RespuestaCodigo,
  SituacionEnElTorneo,
} from '@setpoint/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// Los pedidos de la inscripción desde el link (F12). Las rutas de /api/inscripcion piden la sesión
// del código; la búsqueda es pública.

export function usePedirCodigo() {
  return useMutation({
    mutationFn: (datos: DatosPedirCodigo) => pedir<void>('POST', '/api/auth/codigo', datos),
  });
}

export function useVerificarCodigo() {
  return useMutation({
    mutationFn: (datos: DatosVerificarCodigo) => pedir<RespuestaCodigo>('POST', '/api/auth/codigo/verificar', datos),
  });
}

export function useSituacion(slug: string, torneoId: string, token: string | undefined) {
  return useQuery({
    queryKey: ['situacion', slug, torneoId, token],
    queryFn: () => pedir<SituacionEnElTorneo>('GET', `/api/inscripcion/${slug}/torneos/${torneoId}`, undefined, token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useBusqueda(slug: string, torneoId: string, consulta: string) {
  const lista = consulta.trim().length >= 3;
  return useQuery({
    queryKey: ['busqueda-padron', slug, torneoId, consulta.trim()],
    queryFn: () =>
      pedir<BusquedaEnElPadron>('GET', `/api/publico/${slug}/torneos/${torneoId}/padron?q=${encodeURIComponent(consulta.trim())}`),
    enabled: lista,
    retry: false,
  });
}

export function useReservar(slug: string, torneoId: string, token: string | undefined) {
  return useMutation({
    mutationFn: (datos: DatosReservar) => pedir<Reserva>('POST', `/api/inscripcion/${slug}/torneos/${torneoId}`, datos, token),
  });
}
