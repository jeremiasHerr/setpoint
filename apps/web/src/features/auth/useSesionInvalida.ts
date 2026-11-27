import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrarSesion } from './sesion';

// Errores que significan que esta sesión ya no sirve para esta organización.
const ERRORES_DE_SESION = ['NO_AUTENTICADO', 'SIN_PERMISO', 'ORGANIZACION_NO_ENCONTRADA'];

// Si la API rechazó la sesión, la borra, limpia la caché y manda a ingresar. Devuelve si eso está
// pasando, para que la pantalla no muestre un error mientras se va.
export function useSesionInvalida(error: Error | null) {
  const navegar = useNavigate();
  const queryClient = useQueryClient();
  const sesionInvalida = error !== null && ERRORES_DE_SESION.includes(error.message);

  useEffect(() => {
    if (sesionInvalida) {
      borrarSesion();
      queryClient.clear();
      navegar('/ingresar', { replace: true });
    }
  }, [sesionInvalida, navegar, queryClient]);

  return sesionInvalida;
}
