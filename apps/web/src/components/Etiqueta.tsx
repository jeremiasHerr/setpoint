import type { HTMLAttributes } from 'react';

type Variante = 'lona' | 'noche';

const estilos: Record<Variante, string> = {
  lona: 'bg-lona-fondo text-lona-texto',
  noche: 'bg-noche text-white',
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  variante?: Variante;
};

// Píldora informativa. No se toca: para filtros y opciones está Chip.
export function Etiqueta({ variante = 'lona', className = '', ...props }: Props) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-[9px] text-xs font-semibold ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
