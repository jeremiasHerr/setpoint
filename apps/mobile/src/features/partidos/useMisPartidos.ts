import type { PreferenciaTelefono, RespuestaMisPartidos } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// Los partidos del jugador en el circuito elegido. Pide login (decisión 044).
export function useMisPartidos() {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';

  return useQuery({
    queryKey: ['mis-partidos', slug],
    queryFn: () => pedir<RespuestaMisPartidos>('GET', `/api/jugador/${slug}/partidos`, undefined, sesion?.token),
    enabled: slug !== '',
    retry: 1,
  });
}

// Si sus rivales ven su teléfono (decisión 128). La API devuelve Cuándo juego actualizado.
export function useGuardarTelefono() {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (datos: PreferenciaTelefono) => pedir<RespuestaMisPartidos>('PUT', `/api/jugador/${slug}/telefono`, datos, sesion?.token),
    onSuccess: (respuesta) => cliente.setQueryData(['mis-partidos', slug], respuesta),
  });
}
