import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
  // Texto de ayuda a la derecha, dentro del campo: "zonas", "por zona".
  sufijo?: string;
};

export function Campo({ id, rotulo, numerico = false, sufijo, className = '', ...props }: Props) {
  // Inválido, el borde pasa a noche y grueso como con el foco: en noche y no en rojo (decisión 099).
  const input = (
    <input
      id={id}
      className={`h-12 rounded-control border border-borde-campo px-3.5 text-[15px] text-noche outline-none placeholder:text-pizarra-400 focus:border-2 focus:border-noche focus:px-[13px] aria-invalid:border-2 aria-invalid:border-noche aria-invalid:px-[13px] ${numerico ? 'font-mono tabular-nums' : ''}`}
      {...props}
    />
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-[13px] font-semibold text-pizarra-500">
        {rotulo}
      </label>
      {sufijo ? (
        <div className="relative flex flex-col">
          {input}
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-pizarra-500">{sufijo}</span>
        </div>
      ) : (
        input
      )}
    </div>
  );
}
