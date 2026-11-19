import type { ButtonHTMLAttributes } from 'react';

type Variante = 'principal' | 'organizador' | 'secundario';

// La lona es la acción del jugador; la noche, la del organizador; el secundario va en papel con
// borde (design.md §6). Con el mouse, la lona se oscurece, la noche se aclara a pizarra y el
// secundario toma la línea suave. Deshabilitados, no reaccionan.
const estilos: Record<Variante, string> = {
  // Blanco sobre lona-texto, con borde lona (decisión 114).
  principal: 'border border-lona bg-lona-texto text-white enabled:hover:brightness-125',
  organizador: 'bg-noche text-white enabled:hover:bg-pizarra-700',
  secundario: 'border border-linea bg-papel text-noche enabled:hover:bg-linea-suave',
};

// Al apretar, apenas más chico; con el teclado, un anillo de 2 px en noche. Es un outline y no una
// sombra: el producto no tiene sombras (design.md §2).
const estados =
  'motion-safe:transition-[transform,background-color] motion-safe:duration-100 enabled:active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-noche';

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
