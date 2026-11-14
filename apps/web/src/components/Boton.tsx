import type { ButtonHTMLAttributes } from 'react';

type Variante = 'principal' | 'organizador' | 'secundario';

// Los tres reaccionan al mouse, sin tokens nuevos: el lima se oscurece un poco, el negro se aclara al
// gris-700 y el secundario toma el fondo. Deshabilitados, no reaccionan.
const estilos: Record<Variante, string> = {
  principal: 'bg-lima text-negro enabled:hover:brightness-[.93]',
  organizador: 'bg-negro text-white enabled:hover:bg-gris-700',
  secundario: 'border border-linea text-negro enabled:hover:bg-fondo',
};

// Al apretar, apenas más chico; con el teclado, un anillo negro de 2 px. Es un outline y no una
// sombra: el sistema no tiene sombras (design.md §2).
const estados =
  'motion-safe:transition-[transform,background-color,filter] motion-safe:duration-100 enabled:active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negro';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  grande?: boolean;
};

export function Boton({ variante = 'secundario', grande = false, type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex ${grande ? 'h-12' : 'h-10'} items-center justify-center gap-2 rounded-control px-4 text-[15px] font-medium disabled:opacity-40 ${estados} ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
