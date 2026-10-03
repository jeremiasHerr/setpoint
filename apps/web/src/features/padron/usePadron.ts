import type { DatosCrearJugador, DatosEditarJugador } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crearJugador, editarJugador, listarPadron } from './api';

export function usePadron(slug: string) {
  return useQuery({
    queryKey: ['padron', slug],
    queryFn: () => listarPadron(slug),
    retry: false,
  });
}

// Cualquier cambio vuelve a pedir el padrón entero: el puesto de un jugador depende de los demás.
// También el circuito, que muestra cuántos jugadores hay.
function useRefrescar(slug: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['padron', slug] });
    void queryClient.invalidateQueries({ queryKey: ['circuito', slug] });
  };
}

export function useCrearJugador(slug: string) {
  const refrescar = useRefrescar(slug);
  return useMutation({
    mutationFn: (datos: DatosCrearJugador) => crearJugador(slug, datos),
    onSuccess: refrescar,
  });
}

export function useEditarJugador(slug: string) {
  const refrescar = useRefrescar(slug);
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosEditarJugador }) => editarJugador(slug, id, datos),
    onSuccess: refrescar,
  });
}
