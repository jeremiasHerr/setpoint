import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { borrarSesion } from './sesion';

// El token no se invalida en la API: salir es olvidarlo en este navegador.
export function useCerrarSesion() {
  const navegar = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    borrarSesion();
    // Lo que quedó en caché es de esta organización: quien entre después no tiene que verlo.
    queryClient.clear();
    navegar('/ingresar', { replace: true });
  };
}
