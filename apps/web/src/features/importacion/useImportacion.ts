import type { DatosAplicarImportacion, DatosConfirmarImportacion } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  aplicarImportacion,
  confirmarImportacion,
  descartarImportacion,
  deshacerImportacion,
  obtenerImportacion,
  subirPlanilla,
} from './api';

const clave = (slug: string, id: number | null) => ['importacion', slug, id];

export function useImportacion(slug: string, id: number | null) {
  return useQuery({
    queryKey: clave(slug, id),
    queryFn: () => obtenerImportacion(slug, id!),
    enabled: id !== null,
    retry: false,
  });
}

// La respuesta ya es la importación procesada: se deja en la caché para no pedirla de nuevo.
export function useSubirPlanilla(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ archivos, categoria }: { archivos: File[]; categoria: string | null }) => subirPlanilla(slug, archivos, categoria),
    onSuccess: (importacion) => queryClient.setQueryData(clave(slug, importacion.id), importacion),
  });
}

// Confirmar cambia el padrón y el ranking: se vuelven a pedir, igual que tras un alta manual.
export function useConfirmarImportacion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosConfirmarImportacion) => confirmarImportacion(slug, id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clave(slug, id) });
      void queryClient.invalidateQueries({ queryKey: ['padron', slug] });
      void queryClient.invalidateQueries({ queryKey: ['circuito', slug] });
    },
  });
}

// Aplicar y deshacer también cambian el padrón y el ranking.
export function useAplicarImportacion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosAplicarImportacion) => aplicarImportacion(slug, id, datos),
    onSuccess: (importacion) => {
      queryClient.setQueryData(clave(slug, id), importacion);
      void queryClient.invalidateQueries({ queryKey: ['padron', slug] });
      void queryClient.invalidateQueries({ queryKey: ['circuito', slug] });
    },
  });
}

export function useDeshacerImportacion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deshacerImportacion(slug, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clave(slug, id) });
      void queryClient.invalidateQueries({ queryKey: ['padron', slug] });
      void queryClient.invalidateQueries({ queryKey: ['circuito', slug] });
    },
  });
}

export function useDescartarImportacion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => descartarImportacion(slug, id),
    onSuccess: (importacion) => queryClient.setQueryData(clave(slug, id), importacion),
  });
}
