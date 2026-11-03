import type { CoordinacionDelPartido, DatosFechaAcordadaEntrada } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// La coordinación de un partido del jugador (F14): lo que necesita Anotar la fecha.
export function useCoordinacion(partidoId: number) {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';

  return useQuery({
    queryKey: ['coordinacion', slug, partidoId],
    queryFn: () =>
      pedir<CoordinacionDelPartido>('GET', `/api/jugador/${slug}/partidos/${partidoId}/coordinacion`, undefined, sesion?.token),
    enabled: slug !== '' && Number.isInteger(partidoId),
    retry: 1,
  });
}

// Anota, cambia o reprograma la fecha. Al guardar, Cuándo juego y Mi zona se vuelven a pedir:
// el partido ya tiene fecha.
export function useAnotarFecha(partidoId: number) {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosFechaAcordadaEntrada) =>
      pedir<CoordinacionDelPartido>('PUT', `/api/jugador/${slug}/partidos/${partidoId}/fecha`, datos, sesion?.token),
    onSuccess: (coordinacion) => {
      cliente.setQueryData(['coordinacion', slug, partidoId], coordinacion);
      void cliente.invalidateQueries({ queryKey: ['mis-partidos', slug] });
      void cliente.invalidateQueries({ queryKey: ['mi-zona', slug] });
    },
  });
}
