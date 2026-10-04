import { Link } from 'react-router-dom';
import { Logo } from './Logo';

type ItemNavegacion = {
  etiqueta: string;
  href: string;
};

type Props = {
  organizacion: string;
  navegacion?: ItemNavegacion[];
  activo?: string;
  // Texto en mono a la derecha, para pantallas sin navegación (por ejemplo, la configuración).
  estado?: string;
  // Iniciales de quien inició sesión, para el círculo de la derecha.
  iniciales?: string;
  // Si llega, aparece "Salir" al lado de las iniciales.
  alSalir?: () => void;
};

export function EncabezadoOrganizador({ organizacion, navegacion = [], activo, estado, iniciales, alSalir }: Props) {
  return (
    <header className="flex h-[60px] items-center justify-between gap-6 bg-negro px-7">
      <div className="flex min-w-0 items-center gap-3.5">
        <Logo sobreNegro />
        <div className="h-[18px] w-px bg-borde-oscuro" />
        <span className="truncate text-sm whitespace-nowrap text-gris-400">{organizacion}</span>
      </div>

      {(navegacion.length > 0 || iniciales || alSalir) && (
        <div className="flex shrink-0 items-center gap-5">
          {navegacion.length > 0 && (
            <nav className="flex items-center gap-1">
              {navegacion.map(({ etiqueta, href }) => {
                const esActivo = etiqueta === activo;
                return (
                  <Link
                    key={href}
                    to={href}
                    aria-current={esActivo ? 'page' : undefined}
                    className={`flex h-[34px] items-center rounded-lg px-[13px] text-sm ${
                      esActivo ? 'bg-carbon font-semibold text-white' : 'text-gris-400 hover:text-white'
                    }`}
                  >
                    {etiqueta}
                  </Link>
                );
              })}
            </nav>
          )}

          {iniciales && (
            <span className="flex size-8 items-center justify-center rounded-full border border-borde-oscuro bg-carbon text-[13px] font-semibold text-white">
              {iniciales}
            </span>
          )}

          {alSalir && (
            <button type="button" onClick={alSalir} className="text-sm text-gris-400 hover:text-white">
              Salir
            </button>
          )}
        </div>
      )}

      {estado && <span className="hidden shrink-0 font-mono text-[13px] text-gris-400 tabular-nums md:inline">{estado}</span>}
    </header>
  );
}
