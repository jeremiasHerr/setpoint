import { useMutation } from '@tanstack/react-query';
import { FormularioRecuperarContrasena } from '../components/acceso/FormularioRecuperarContrasena';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';
import { pedirRecuperacion } from '../features/auth/api';
import { ErrorApi } from '../lib/api';

function mensajeDe(error: Error | null): string | undefined {
  if (!error) return undefined;
  if (error instanceof ErrorApi && error.codigo === 'DATOS_INVALIDOS') return 'El email no es válido.';
  if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') {
    return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
  }
  return 'No pudimos mandar el link. Probá de nuevo en unos minutos.';
}

export function RecuperarContrasenaPage() {
  const pedido = useMutation({ mutationFn: pedirRecuperacion });

  return (
    <PantallaAcceso pregunta="¿Te acordaste?" enlace={{ texto: 'Ingresar', a: '/ingresar' }}>
      <div className="mx-auto w-full max-w-[420px]">
        <FormularioRecuperarContrasena
          alEnviar={(email) => pedido.mutate(email)}
          enviando={pedido.isPending}
          enviado={pedido.isSuccess}
          error={mensajeDe(pedido.error)}
        />
      </div>
    </PantallaAcceso>
  );
}
