import { Link } from 'react-router-dom';

type Variante = 'lima' | 'negro' | 'contornoOscuro';

const estilos: Record<Variante, string> = {
  lima: 'bg-lima font-semibold text-negro',
  negro: 'bg-negro font-semibold text-white hover:text-white',
  contornoOscuro: 'border border-borde-oscuro font-medium text-white hover:bg-carbon',
};

type Props = {
  a: string;
  variante: Variante;
  children: string;
};

// Un enlace con forma de botón grande: el Boton del sistema es un <button> y acá se navega.
export function EnlaceAccion({ a, variante, children }: Props) {
  return (
    <Link
      to={a}
      className={`inline-flex h-13 items-center justify-center rounded-xl px-[22px] text-base ${estilos[variante]}`}
    >
      {children}
    </Link>
  );
}
