import type { ButtonHTMLAttributes } from 'react';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  encendido: boolean;
  alCambiar: (encendido: boolean) => void;
};

// Prendido, verde lona oscuro; apagado, pizarra; la bolita siempre blanca (design.md §6). Los dos
// estados se distinguen de un vistazo sobre el papel y sobre la niebla (decisiones 090 y 105).
export function Interruptor({ encendido, alCambiar, className = '', ...props }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      onClick={() => alCambiar(!encendido)}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[3px] transition-colors ${
        encendido ? 'justify-end bg-lona-texto' : 'justify-start bg-pizarra-400'
      } ${className}`}
      {...props}
    >
      <span className="size-[18px] rounded-full bg-papel" />
    </button>
  );
}
