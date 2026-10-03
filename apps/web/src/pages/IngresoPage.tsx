import { Navigate } from 'react-router-dom';
import { FormularioIngreso } from '../components/acceso/FormularioIngreso';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';
import { leerSesion } from '../features/auth/sesion';
import { useIngreso } from '../features/auth/useIngreso';
import { ErrorApi } from '../lib/api';

function mensajeDe(error: Error | null): string | undefined {
  if (!error) return undefined;
  if (!(error instanceof ErrorApi)) return 'Algo salió mal. Probá de nuevo.';

  switch (error.codigo) {
    // Un email mal escrito también es "no son correctos": el formulario no distingue cuál de los dos falló.
    case 'CREDENCIALES_INVALIDAS':
    case 'DATOS_INVALIDOS':
      return 'El email o la contraseña no son correctos.';
    case 'SIN_ORGANIZACION':
      return 'Tu cuenta no administra ninguna organización. Si sos jugador, entrá desde la app.';
    case 'SIN_CONEXION':
      return 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.';
    default:
      return 'No pudimos ingresar. Probá de nuevo en unos minutos.';
  }
}

export function IngresoPage() {
  const ingreso = useIngreso();

  // Con una sesión guardada no hay nada que hacer acá. Si el token venció, /inicio la borra y vuelve.
  if (leerSesion()) return <Navigate to="/inicio" replace />;

  return (
    <PantallaAcceso pregunta="¿Todavía no tenés cuenta?" enlace={{ texto: 'Registrá tu organización', a: '/registro' }}>
      <div className="mx-auto w-full max-w-[420px]">
        <FormularioIngreso
          alEnviar={(datos) => ingreso.mutate(datos)}
          enviando={ingreso.isPending}
          error={mensajeDe(ingreso.error)}
        />
      </div>
    </PantallaAcceso>
  );
}
