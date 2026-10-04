import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
  // Texto de ayuda a la derecha, dentro del campo: "zonas", "por zona".
  sufijo?: string;
};

export function Campo({ id, rotulo, numerico = false, sufijo, className = '', ...props }: Props) {
  const input = (
    <input
      id={id}
      className={`h-12 rounded-control border border-gris-300 px-3.5 text-[15px] text-negro outline-none placeholder:text-gris-400 focus:border-2 focus:border-negro focus:px-[13px] ${numerico ? 'font-mono tabular-nums' : ''}`}
      {...props}
    />
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-gris-500">
        {rotulo}
      </label>
      {sufijo ? (
        <div className="relative flex flex-col">
          {input}
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-gris-500">{sufijo}</span>
        </div>
      ) : (
        input
      )}
    </div>
  );
}
