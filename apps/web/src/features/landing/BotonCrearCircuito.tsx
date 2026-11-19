import { Link } from 'react-router-dom';

// La única acción de la landing: crear el circuito. Es el botón principal, con el texto en el blanco
// del logo (decisión 114).
export function BotonCrearCircuito({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/registro"
      className={`inline-flex h-12 items-center justify-center rounded-control border border-lona bg-lona-texto px-5 text-[16px] leading-none font-semibold whitespace-nowrap text-white transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${className}`}
    >
      Crear mi circuito
    </Link>
  );
}
