import type { CoordinacionDelPartido } from '@setpoint/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from '../auth/SesionProvider';

// El rival confirma con un toque la fecha que anotó el otro (04-flujo-jugador §6.3). Al confirmar,
// el partido queda agendado para los dos y Cuándo juego se vuelve a pedir.
export function useConfirmarFecha() {
  const { sesion, perfil } = useSesion();
  const slug = perfil?.organizacion.slug ?? '';
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (partidoId: number) =>
      pedir<CoordinacionDelPartido>('POST', `/api/jugador/${slug}/partidos/${partidoId}/confirmacion`, undefined, sesion?.token),
    // También si falla: el rival pudo cambiarla mientras tanto, y la pantalla tiene que mostrar la de ahora.
    onSettled: () => {
      void cliente.invalidateQueries({ queryKey: ['mis-partidos', slug] });
      void cliente.invalidateQueries({ queryKey: ['mi-zona', slug] });
    },
  });
}
