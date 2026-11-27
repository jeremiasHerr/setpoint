import { Link } from 'react-router-dom';
import { inicioDeSetpoint } from '../features/auth/sesion';
import { Logo } from './Logo';
import { ConCifras } from './Numero';

type Props = {
  // El circuito de la página. Sin él, solo el logo: el pago o un link que ya no anda.
  organizacion?: string;
  // Lo que se está mirando, al lado del nombre: "Copa Alta Barda 2026 · Tercera".
  detalle?: string;
};

// La marca arriba de las páginas públicas, que no tienen sesión ni menú: el logo de Setpoint, que
// lleva al Inicio de quien administra o a la página de Setpoint, y el circuito (decisión 157).
export function EncabezadoPublico({ organizacion, detalle }: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-1">
      {/* El logo y el circuito no se separan: a 375, con el chip de la categoría al lado, el nombre
          bajaba de línea y dejaba la raya colgando. Si no entra, se recorta. */}
      <div className="flex min-w-0 items-center gap-3">
        <Link to={inicioDeSetpoint()} aria-label="Setpoint, ir al inicio" className="shrink-0 rounded-[4px]">
          <Logo />
        </Link>
        {organizacion && (
          <>
            <div className="h-[18px] w-px shrink-0 bg-linea" />
            <span className="truncate text-base font-semibold tracking-[-0.015em]" title={organizacion}>
              {organizacion}
            </span>
          </>
        )}
      </div>
      {detalle && (
        <>
          <div className="hidden h-[18px] w-px bg-linea sm:block" />
          <ConCifras className="text-[13px] text-pizarra-500">{detalle}</ConCifras>
        </>
      )}
    </div>
  );
}
