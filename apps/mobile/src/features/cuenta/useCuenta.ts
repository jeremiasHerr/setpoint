import type { Cuenta } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

export const claveCuenta = (token: string | undefined) => ['cuenta', token];

// Los circuitos, las inscripciones en curso y los avisos (decisión 054). Los perfiles ya no llegan
// solo al ingresar: se vuelve a pedir al abrir la app y al volver al frente (lo hace el layout para
// todas las consultas), que es cuando se ve que se confirmó un pago hecho en MercadoPago.
export function useCuenta(token: string | undefined) {
  return useQuery({
    queryKey: claveCuenta(token),
    queryFn: () => pedir<Cuenta>('GET', '/api/auth/cuenta', undefined, token),
    enabled: Boolean(token),
    retry: 1,
  });
}
