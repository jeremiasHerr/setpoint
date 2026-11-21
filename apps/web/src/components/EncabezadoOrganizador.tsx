import { useEffect, useId, useRef, useState } from 'react';
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
  // Iniciales de quien inició sesión, para el círculo de la derecha.
  iniciales?: string;
  // Si llega, aparece "Salir" al lado de las iniciales.
  alSalir?: () => void;
};

// En el celular el menú, las iniciales y Salir no entran en una fila: debajo de
// 768 px van en un panel que se abre con "Menú" (decisión 109).
export function EncabezadoOrganizador({ organizacion, navegacion = [], activo, iniciales, alSalir }: Props) {
  const idPanel = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const hayAlgo = navegacion.length > 0 || iniciales || alSalir;

  // Al abrir, el foco pasa al primer link para poder recorrer el panel con teclado.
  useEffect(() => {
    if (abierto) panel.current?.querySelector('a')?.focus();
  }, [abierto]);

  // Escape cierra y devuelve el foco al botón que abrió el panel.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  return (
    <header
      className={`relative flex h-[60px] items-center justify-between gap-2 bg-noche-900 px-4 md:gap-6 md:px-7 ${
        abierto ? 'z-40' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
        <Link to="/inicio" aria-label="Ir al inicio" className="rounded-[7px]">
          <Logo sobreNoche />
        </Link>
        <div className="h-[18px] w-px bg-borde-noche" />
        <span title={organizacion} className="truncate text-[13px] whitespace-nowrap text-pizarra-400 md:text-sm">{organizacion}</span>
      </div>

      {hayAlgo && (
        <div className="hidden shrink-0 items-center gap-5 md:flex">
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
                      esActivo ? 'bg-noche-2 font-semibold text-white' : 'text-pizarra-400 hover:text-white'
                    }`}
                  >
                    {etiqueta}
                  </Link>
                );
              })}
            </nav>
          )}

          {iniciales && (
            <span className="flex size-8 items-center justify-center rounded-full border border-borde-noche bg-noche-2 text-[13px] font-semibold text-white">
              {iniciales}
            </span>
          )}

          {alSalir && (
            <button type="button" onClick={alSalir} className="text-sm text-pizarra-400 hover:text-white">
              Salir
            </button>
          )}
        </div>
      )}

      {hayAlgo && (
        <button
          ref={boton}
          type="button"
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto(!abierto)}
          className={`flex h-9 shrink-0 items-center rounded-control border border-borde-noche px-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden ${abierto ? 'bg-noche-2' : ''}`}
        >
          {abierto ? 'Cerrar' : 'Menú'}
        </button>
      )}

      {abierto && (
        <>
          {/* Dentro del header, que con z-40 arma su propio apilamiento: con -z-10 el velo tapa la
              página pero queda debajo del logo y del botón. */}
          <div aria-hidden="true" onClick={cerrar} className="fixed inset-0 -z-10 bg-noche/40 backdrop-blur-[4px] md:hidden" />
          <nav
            ref={panel}
            id={idPanel}
            aria-label="Menú"
            className="absolute inset-x-0 top-full z-40 flex flex-col border-t border-borde-noche bg-noche-900 px-4 pt-1.5 pb-3.5 md:hidden"
          >
            {navegacion.map(({ etiqueta, href }) => {
              const esActivo = etiqueta === activo;
              return (
                <Link
                  key={href}
                  to={href}
                  aria-current={esActivo ? 'page' : undefined}
                  onClick={cerrar}
                  className={`flex h-12 items-center rounded-control px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
                    esActivo ? 'bg-noche-2 font-semibold text-white' : 'font-medium text-pizarra-400 hover:text-white'
                  }`}
                >
                  {etiqueta}
                </Link>
              );
            })}

            {(iniciales || alSalir) && (
              <>
                <div className="my-2 h-px bg-borde-noche" />
                <div className="flex min-h-12 items-center justify-between gap-3 px-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    {iniciales && (
                      <span className="flex size-8 items-center justify-center rounded-full border border-borde-noche bg-noche-2 text-[13px] font-semibold text-white">
                        {iniciales}
                      </span>
                    )}
                    <span className="truncate text-sm text-pizarra-400">{organizacion}</span>
                  </span>
                  {alSalir && (
                    <button
                      type="button"
                      onClick={alSalir}
                      className="flex h-11 shrink-0 items-center px-1 text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Salir
                    </button>
                  )}
                </div>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
