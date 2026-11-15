import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type Miga = { etiqueta: ReactNode; ruta: string };

type Props = {
  // El camino hasta acá, del primer nivel al más cercano. Cada una es un link.
  anteriores: Miga[];
  // Dónde se está: va última y sin link.
  children: ReactNode;
  // Para la pantalla que tiene que hacer algo antes de irse, como guardar: recibe la ruta y navega
  // ella. Con Ctrl o en otra pestaña, el link abre como siempre.
  alIr?: (ruta: string) => void;
  // El tamaño del texto: chico arriba del título, como el título en la franja del torneo.
  className?: string;
};

// Las migas de pan de las pantallas internas de la organización (decisión 100): dicen dónde se está
// y vuelven a cualquier nivel de arriba.
export function Migas({ anteriores, children, alIr, className = 'text-sm' }: Props) {
  function ir(evento: MouseEvent<HTMLAnchorElement>, ruta: string) {
    if (!alIr || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    alIr(ruta);
  }

  return (
    <nav aria-label="Dónde estás" className={`min-w-0 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {anteriores.map(({ etiqueta, ruta }) => (
          <li key={ruta} className="flex items-center gap-1.5">
            <Link to={ruta} onClick={(evento) => ir(evento, ruta)} className="py-1 text-gris-500 hover:text-negro">
              {etiqueta}
            </Link>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3 shrink-0 text-gris-400"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </li>
        ))}
        <li className="min-w-0 text-gris-700">{children}</li>
      </ol>
    </nav>
  );
}
