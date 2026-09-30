import { FormularioIngreso } from '../components/acceso/FormularioIngreso';
import { PantallaAcceso } from '../components/acceso/PantallaAcceso';

export function IngresoPage() {
  return (
    <PantallaAcceso pregunta="¿Todavía no tenés cuenta?" enlace={{ texto: 'Registrá tu organización', a: '/registro' }}>
      <div className="mx-auto w-full max-w-[420px]">
        <FormularioIngreso />
      </div>
    </PantallaAcceso>
  );
}
