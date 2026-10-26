import type { DatosPedirCodigo, DatosVerificarCodigo, RespuestaCodigo } from '@setpoint/shared';
import { useMutation } from '@tanstack/react-query';
import { pedir } from '../../lib/api';
import { useSesion } from './SesionProvider';

// El jugador entra con su email y un código que le llega por email, sin contraseña (decisión 049).
export function usePedirCodigo() {
  return useMutation({
    mutationFn: (datos: DatosPedirCodigo) => pedir<void>('POST', '/api/auth/codigo', datos),
  });
}

export function useVerificarCodigo() {
  const { ingresar } = useSesion();

  return useMutation({
    // Entra aunque todavía no juegue en ningún circuito: ve sus inscripciones en curso (decisión 054).
    mutationFn: (datos: DatosVerificarCodigo) => pedir<RespuestaCodigo>('POST', '/api/auth/codigo/verificar', datos),
    // Al guardar la sesión, la navegación lleva sola al inicio, a elegir el circuito o a las
    // inscripciones en curso.
    onSuccess: ingresar,
  });
}
