import { Link } from 'react-router-dom';

// La única acción de la landing: crear el circuito. Es el botón principal, que sobre la noche va dado
// vuelta: papel con el texto noche (decisión 115).
export function BotonCrearCircuito({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/registro"
      className={`inline-flex h-12 items-center justify-center rounded-control bg-papel px-5 text-[16px] leading-none font-semibold whitespace-nowrap text-noche-900 transition hover:bg-linea-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${className}`}
    >
      Crear mi circuito
    </Link>
  );
}
