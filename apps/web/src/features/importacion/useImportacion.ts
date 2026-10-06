import type { DatosConfirmarImportacion } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmarImportacion, descartarImportacion, obtenerImportacion, subirPlanilla } from './api';

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
    mutationFn: ({ archivo, categoria }: { archivo: File; categoria: string }) => subirPlanilla(slug, archivo, categoria),
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

export function useDescartarImportacion(slug: string, id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => descartarImportacion(slug, id),
    onSuccess: (importacion) => queryClient.setQueryData(clave(slug, id), importacion),
  });
}
