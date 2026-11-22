import type { CargaDelResultado, DatosResultadoDelJugador, RespuestaMisPartidos } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// Lo que necesita Cargar el resultado (decisión 127): el partido desde su lado y el sistema de juego.
export function useCargaDelResultado(partidoId: number) {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';

  return useQuery({
    queryKey: ['carga-del-resultado', slug, partidoId],
    queryFn: () => pedir<CargaDelResultado>('GET', `/api/jugador/${slug}/partidos/${partidoId}/resultado`, undefined, sesion?.token),
    enabled: slug !== '' && Number.isInteger(partidoId),
    retry: 1,
  });
}

// Manda el resultado: queda esperando que el rival lo confirme. La API devuelve Cuándo juego
// actualizado, así que se guarda sin volver a pedirlo.
export function useCargarResultado(partidoId: number) {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosResultadoDelJugador) =>
      pedir<RespuestaMisPartidos>('PUT', `/api/jugador/${slug}/partidos/${partidoId}/resultado`, datos, sesion?.token),
    onSuccess: (misPartidos) => {
      cliente.setQueryData(['mis-partidos', slug], misPartidos);
      void cliente.invalidateQueries({ queryKey: ['carga-del-resultado', slug, partidoId] });
    },
  });
}
