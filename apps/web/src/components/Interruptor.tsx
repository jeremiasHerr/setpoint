import type { ButtonHTMLAttributes } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  encendido: boolean;
  alCambiar: (encendido: boolean) => void;
};

export function Interruptor({ encendido, alCambiar, className = '', ...props }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      onClick={() => alCambiar(!encendido)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[3px] ${
        encendido ? 'justify-end bg-negro' : 'justify-start bg-linea'
      } ${className}`}
      {...props}
    >
      <span className={`size-[18px] rounded-full bg-white ${encendido ? '' : 'border border-linea'}`} />
    </button>
  );
}
