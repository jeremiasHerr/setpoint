import { Link } from 'react-router-dom';
import { inicioDeSetpoint } from '../features/auth/sesion';
import { Logo } from './Logo';
import { ConCifras } from './Numero';

// El mismo ancho que el <main> de cada página, para que la banda y el contenido queden alineados.
const ANCHOS = {
  angosto: 'max-w-[480px]',
  // El ranking, la ficha y el torneo: 1040 desde 1024 px (decisiones 155 y 156).
  ancho: 'max-w-[480px] lg:max-w-[1040px] lg:px-8',
  // El torneo en vivo, que en la compu usa todo el ancho para los cuadros.
  completo: 'max-w-[480px] md:max-w-[960px] md:px-6 xl:max-w-none xl:px-[30px]',
} as const;

type Props = {
  // El circuito de la página. Sin él, solo el logo: mientras carga, el pago o un link que ya no anda.
  organizacion?: string;
  // Lo que se está mirando, al lado del nombre: "Copa Alta Barda 2026 · Tercera".
  detalle?: string;
  // El ranking del circuito, si lo lleva y la página no es el ranking.
  rutaRanking?: string;
  ancho?: keyof typeof ANCHOS;
};

// La banda del circuito arriba de las páginas públicas, que no tienen sesión ni menú (decisión 158):
// el logo de Setpoint, que lleva al Inicio de quien administra o a la landing (decisión 157), y el
// circuito. Va fuera del <main>, a todo el ancho.
export function EncabezadoPublico({ organizacion, detalle, rutaRanking, ancho = 'angosto' }: Props) {
  return (
    <header className="bg-noche-900 text-white">
      <div className={`mx-auto flex min-h-14 items-center justify-between gap-4 px-4 py-3 ${ANCHOS[ancho]}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {/* El logo y el circuito no se separan: si el nombre no entra, se recorta. */}
          <div className="flex min-w-0 items-center gap-3">
            <Link to={inicioDeSetpoint()} aria-label="Setpoint, ir al inicio" className="shrink-0 rounded-[4px]">
              <Logo sobreNoche />
            </Link>
            {organizacion && (
              <>
                <div className="h-[18px] w-px shrink-0 bg-borde-noche" />
                <span className="truncate text-base font-semibold tracking-[-0.015em]" title={organizacion}>
                  {organizacion}
                </span>
              </>
            )}
          </div>
          {detalle && (
            <>
              <div className="hidden h-[18px] w-px bg-borde-noche sm:block" />
              <ConCifras className="text-[13px] text-pizarra-400">{detalle}</ConCifras>
            </>
          )}
        </div>
        {rutaRanking && (
          <Link to={rutaRanking} className="shrink-0 rounded-[4px] py-1 text-sm font-medium text-pizarra-400 hover:text-white">
            Ranking
          </Link>
        )}
      </div>
    </header>
  );
}
