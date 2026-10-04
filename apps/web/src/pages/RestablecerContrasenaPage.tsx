import { useMutation } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormularioRestablecerContrasena } from '../components/acceso/FormularioRestablecerContrasena';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';
import { Tarjeta } from '../components/Tarjeta';
import { restablecerContrasena } from '../features/auth/api';
import { ErrorApi } from '../lib/api';

function PedirOtroLink() {
  return (
    <Link to="/recuperar-contrasena" className="font-medium underline">
      Pedí uno nuevo
    </Link>
  );
}

function mensajeDe(error: Error | null): ReactNode {
  if (!error) return undefined;
  if (!(error instanceof ErrorApi)) return 'Algo salió mal. Probá de nuevo.';

  switch (error.codigo) {
    case 'LINK_INVALIDO':
      return (
        <>
          Este link venció o ya se usó. <PedirOtroLink />.
        </>
      );
    case 'DATOS_INVALIDOS':
      return (
        error.campos.contrasena ?? (
          <>
            Este link no es válido. <PedirOtroLink />.
          </>
        )
      );
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos guardar la contraseña. Probá de nuevo en unos minutos.';
  }
}

// A esta pantalla se llega desde el link del mail, que trae el token en la URL.
export function RestablecerContrasenaPage() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') ?? '';
  const cambio = useMutation({ mutationFn: restablecerContrasena });

  return (
    <PantallaAcceso pregunta="¿Te acordaste?" enlace={{ texto: 'Ingresar', a: '/ingresar' }}>
      <div className="mx-auto w-full max-w-[420px]">
        {cambio.isSuccess ? (
          <Tarjeta className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-[-0.03em]">Listo, ya la cambiaste</h1>
              <p className="text-[15px] text-gris-500">Ingresá con tu email y la contraseña nueva.</p>
            </div>
            <Link
              to="/ingresar"
              className="inline-flex h-12 items-center justify-center rounded-control bg-negro text-[15px] font-medium text-white"
            >
              Ingresar
            </Link>
          </Tarjeta>
        ) : (
          <FormularioRestablecerContrasena
            alEnviar={(contrasena) => cambio.mutate({ token, contrasena })}
            enviando={cambio.isPending}
            error={mensajeDe(cambio.error)}
          />
        )}
      </div>
    </PantallaAcceso>
  );
}
