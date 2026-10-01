import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registrarOrganizacion } from './api';
import { guardarSesion } from './sesion';

export function useRegistro() {
  const navegar = useNavigate();

  return useMutation({
    mutationFn: registrarOrganizacion,
    onSuccess: (sesion) => {
      guardarSesion(sesion);
      navegar('/inicio');
    },
  });
}
