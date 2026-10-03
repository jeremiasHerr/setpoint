import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ingresar } from './api';
import { guardarSesion } from './sesion';

export function useIngreso() {
  const navegar = useNavigate();

  return useMutation({
    mutationFn: ingresar,
    onSuccess: (sesion) => {
      guardarSesion(sesion);
      navegar('/inicio');
    },
  });
}
