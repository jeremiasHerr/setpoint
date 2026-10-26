import type { Cuenta } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { pedir } from '../../lib/api';

export const claveCuenta = (token: string | undefined) => ['cuenta', token];

// Los circuitos, las inscripciones en curso y los avisos (decisión 054). Los perfiles ya no llegan
// solo al ingresar: se vuelve a pedir al abrir la app y al volver al frente, que es cuando se ve
// que se confirmó un pago hecho en MercadoPago.
export function useCuenta(token: string | undefined) {
  const consulta = useQuery({
    queryKey: claveCuenta(token),
    queryFn: () => pedir<Cuenta>('GET', '/api/auth/cuenta', undefined, token),
    enabled: Boolean(token),
    retry: 1,
  });

  const { refetch } = consulta;
  useEffect(() => {
    if (!token) return;
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void refetch();
    });
    return () => suscripcion.remove();
  }, [token, refetch]);

  return consulta;
}
