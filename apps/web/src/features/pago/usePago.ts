import type { DatosPagoSimulado, InicioDePago, InscripcionParaPagar } from '@setpoint/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// La inscripción mientras se paga. Al volver de MercadoPago se consulta cada unos segundos hasta que
// el webhook la confirma: la confirmación no viene de la vuelta del checkout (05-pagos §5).
export function useInscripcionParaPagar(slug: string, id: string, token: string | undefined, esperandoConfirmacion: boolean) {
  return useQuery({
    queryKey: ['inscripcion-para-pagar', slug, id, token],
    queryFn: () => pedir<InscripcionParaPagar>('GET', `/api/inscripcion/${slug}/inscripciones/${id}`, undefined, token),
    enabled: Boolean(token),
    retry: false,
    refetchInterval: (query) => (esperandoConfirmacion && query.state.data?.estado === 'reservando' ? 3000 : false),
  });
}

// La solicitud aprobada reserva el lugar al abrir el link del email (decisión 054). Devuelve la
// inscripción ya reservada.
export function useReservarAprobada(slug: string, id: string, token: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pedir<InscripcionParaPagar>('POST', `/api/inscripcion/${slug}/inscripciones/${id}/reservar`, undefined, token),
    onSuccess: (inscripcion) => queryClient.setQueryData(['inscripcion-para-pagar', slug, id, token], inscripcion),
    onError: () => queryClient.invalidateQueries({ queryKey: ['inscripcion-para-pagar', slug, id] }),
  });
}

export function useIniciarPago(slug: string, id: string, token: string | undefined) {
  return useMutation({
    mutationFn: () => pedir<InicioDePago>('POST', `/api/inscripcion/${slug}/inscripciones/${id}/pago`, undefined, token),
  });
}

export function useSimularPago(slug: string, id: string, token: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosPagoSimulado) =>
      pedir<void>('POST', `/api/inscripcion/${slug}/inscripciones/${id}/simulado`, datos, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inscripcion-para-pagar', slug, id] }),
  });
}
