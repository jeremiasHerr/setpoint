import type { ButtonHTMLAttributes } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  encendido: boolean;
  alCambiar: (encendido: boolean) => void;
};

// Prendido, lima con la bolita negra; apagado, gris con la bolita blanca (design.md §6). Los dos
// estados se distinguen sobre blanco y sobre el fondo gris.
export function Interruptor({ encendido, alCambiar, className = '', ...props }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      onClick={() => alCambiar(!encendido)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[3px] transition-colors ${
        encendido ? 'justify-end bg-lima ring-1 ring-negro' : 'justify-start bg-gris-400'
      } ${className}`}
      {...props}
    >
      <span className={`size-[18px] rounded-full ${encendido ? 'bg-negro' : 'bg-white'}`} />
    </button>
  );
}
