import type { DatosDecidirResultadoLeido } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claveNavegacion } from '../torneos/useNavegacionDelTorneo';
import { decidirResultado, leerMensajes, obtenerLectura } from './api';

const claveLectura = (slug: string, id: number, lectura: number | null) => ['lectura-de-mensajes', slug, id, lectura];

export function useLectura(slug: string, id: number, lectura: number | null) {
  return useQuery({
    queryKey: claveLectura(slug, id, lectura),
    queryFn: () => obtenerLectura(slug, id, lectura!),
    enabled: lectura !== null,
    retry: false,
  });
}

// Cargar resultados cambia los partidos, las tablas y, con la final, la pestaña Cierre: se vuelven a
// pedir, como después de una carga a mano.
function useRefrescarElTorneo(slug: string, id: number) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['partidos', slug, id] });
    void queryClient.invalidateQueries({ queryKey: claveNavegacion(slug, id) });
  };
}

export function useLeerMensajes(slug: string, id: number) {
  const queryClient = useQueryClient();
  const refrescar = useRefrescarElTorneo(slug, id);
  return useMutation({
    mutationFn: (texto: string) => leerMensajes(slug, id, texto),
    onSuccess: (lectura) => {
      queryClient.setQueryData(claveLectura(slug, id, lectura.id), lectura);
      refrescar();
    },
  });
}

export function useDecidirResultado(slug: string, id: number, lectura: number) {
  const queryClient = useQueryClient();
  const refrescar = useRefrescarElTorneo(slug, id);
  return useMutation({
    mutationFn: ({ n, ...datos }: DatosDecidirResultadoLeido & { n: number }) => decidirResultado(slug, id, lectura, n, datos),
    onSuccess: (actualizada) => {
      queryClient.setQueryData(claveLectura(slug, id, lectura), actualizada);
      refrescar();
    },
  });
}
