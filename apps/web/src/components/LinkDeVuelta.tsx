import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  // Siempre una ruta fija, no "atrás" en el historial: anda igual desde un link compartido.
  ruta: string;
  // A dónde lleva, sin la flecha: "El torneo", "Ranking".
  children: ReactNode;
};

// La vuelta de las páginas públicas, que no tienen menú ni migas (decisiones 084 y 100).
export function LinkDeVuelta({ ruta, children }: Props) {
  return (
    <Link to={ruta} className="self-start py-1 text-sm text-pizarra-500 hover:text-noche">
      ← {children}
    </Link>
  );
}
