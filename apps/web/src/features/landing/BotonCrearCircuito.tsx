import { Link } from 'react-router-dom';

// La única acción de la landing: crear el circuito. Lona sobre la pared noche, como en design.md.
export function BotonCrearCircuito({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/registro"
      className={`inline-flex h-12 items-center justify-center rounded-control border border-lona-borde bg-lona px-5 text-[16px] leading-none font-semibold whitespace-nowrap text-noche-900 transition-colors hover:bg-lona-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${className}`}
    >
      Crear mi circuito
    </Link>
  );
}
