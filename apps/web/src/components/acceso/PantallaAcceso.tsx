import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

type Props = {
  pregunta: string;
  enlace: { texto: string; a: string };
  children: ReactNode;
};

export function PantallaAcceso({ pregunta, enlace, children }: Props) {
  return (
    <div className="min-h-screen bg-fondo text-negro">
      <header className="flex h-[60px] items-center justify-between gap-4 border-b border-linea bg-white px-4 sm:px-7">
        <Logo />
        <p className="text-sm text-gris-500">
          {pregunta}{' '}
          <Link to={enlace.a} className="font-medium text-negro hover:text-gris-500">
            {enlace.texto}
          </Link>
        </p>
      </header>
      <main className="px-4 py-[30px] sm:px-7">{children}</main>
    </div>
  );
}
