import type { ButtonHTMLAttributes } from 'react';

type Variante = 'principal' | 'organizador' | 'secundario';

const estilos: Record<Variante, string> = {
  principal: 'bg-lima text-negro',
  organizador: 'bg-negro text-white',
  secundario: 'border border-linea text-negro hover:bg-fondo',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
};

export function Boton({ variante = 'secundario', type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-control px-4 text-[15px] font-medium disabled:opacity-40 ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}
