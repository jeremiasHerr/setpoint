import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
};

export function Campo({ id, rotulo, numerico = false, className = '', ...props }: Props) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-gris-500">
        {rotulo}
      </label>
      <input
        id={id}
        className={`h-12 rounded-control border border-gris-300 px-3.5 text-[15px] text-negro outline-none placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[13px] ${numerico ? 'font-mono tabular-nums' : ''}`}
        {...props}
      />
    </div>
  );
}
