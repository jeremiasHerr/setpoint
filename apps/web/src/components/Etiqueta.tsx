import type { HTMLAttributes } from 'react';

type Variante = 'lima' | 'negra';

const estilos: Record<Variante, string> = {
  lima: 'bg-lima text-negro',
  negra: 'bg-negro text-white',
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  variante?: Variante;
};

// Píldora informativa. No se toca: para filtros y opciones está Chip.
export function Etiqueta({ variante = 'lima', className = '', ...props }: Props) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-[9px] text-xs font-semibold ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
