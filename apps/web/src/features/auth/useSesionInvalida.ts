import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrarSesion } from './sesion';

// Errores que significan que esta sesión ya no sirve para esta organización.
const ERRORES_DE_SESION = ['NO_AUTENTICADO', 'SIN_PERMISO', 'ORGANIZACION_NO_ENCONTRADA'];

// Si la API rechazó la sesión, la borra y manda a ingresar. Devuelve si eso está pasando,
// para que la pantalla no muestre un error mientras se va.
export function useSesionInvalida(error: Error | null) {
  const navegar = useNavigate();
  const sesionInvalida = error !== null && ERRORES_DE_SESION.includes(error.message);

  useEffect(() => {
    if (sesionInvalida) {
      borrarSesion();
      navegar('/ingresar', { replace: true });
    }
  }, [sesionInvalida, navegar]);

  return sesionInvalida;
}
