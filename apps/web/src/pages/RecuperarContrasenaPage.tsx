import { FormularioRecuperarContrasena } from '../components/acceso/FormularioRecuperarContrasena';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';

export function RecuperarContrasenaPage() {
  return (
    <PantallaAcceso pregunta="¿Te acordaste?" enlace={{ texto: 'Ingresar', a: '/ingresar' }}>
      <div className="mx-auto w-full max-w-[420px]">
        <FormularioRecuperarContrasena />
      </div>
    </PantallaAcceso>
  );
}
