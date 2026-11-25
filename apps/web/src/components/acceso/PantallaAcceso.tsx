import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

type Props = {
  // Título de la pestaña: la pantalla y Setpoint.
  titulo: string;
  pregunta: string;
  enlace: { texto: string; a: string };
  children: ReactNode;
};

// Ingresar, Registrar la organización y Recuperar la contraseña (decisión 148): la franja noche de la
// landing y del organizador, con el mismo logo, y el formulario en una tarjeta noche, al medio de la
// página clara. Se llega desde la landing y se sigue al panel: las tres pantallas van con la misma franja.
export function PantallaAcceso({ titulo, pregunta, enlace, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-niebla text-noche">
      <title>{`${titulo} · Setpoint`}</title>
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 bg-noche-900 px-4 sm:px-7">
        <Link
          to="/"
          aria-label="Setpoint, inicio"
          className="flex min-h-11 items-center rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Logo sobreNoche />
        </Link>
        <p className="text-sm text-pizarra-400">
          {/* En el celular no entra la pregunta: queda el enlace, que ya dice adónde lleva. */}
          <span className="max-sm:hidden">{pregunta} </span>
          <Link
            to={enlace.a}
            className="inline-flex min-h-11 items-center rounded-control font-medium text-white hover:text-pizarra-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {enlace.texto}
          </Link>
        </p>
      </header>
      <main className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-7 sm:py-12">{children}</main>
    </div>
  );
}
