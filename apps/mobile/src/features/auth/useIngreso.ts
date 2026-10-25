import type { DatosPedirCodigo, DatosVerificarCodigo, RespuestaCodigo } from '@setpoint/shared';
import { useMutation } from '@tanstack/react-query';
import { ErrorApi, pedir } from '../../lib/api';
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
    mutationFn: async (datos: DatosVerificarCodigo) => {
      const respuesta = await pedir<RespuestaCodigo>('POST', '/api/auth/codigo/verificar', datos);
      // La app es para jugar: quien no tiene perfil en ningún circuito no entra (decisión 039).
      if (respuesta.perfiles.length === 0) throw new ErrorApi('SIN_PERFIL_DE_JUGADOR');
      return respuesta;
    },
    // Al guardar la sesión, la navegación lleva sola al inicio o a elegir el circuito.
    onSuccess: ingresar,
  });
}
