import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: string;
  numerico?: boolean;
  // Texto de ayuda a la derecha, dentro del campo: "zonas", "por zona".
  sufijo?: string;
  // Dentro de una tarjeta noche, como el formulario de Ingresar (decisión 148).
  sobreNoche?: boolean;
};

// Inválido, el borde se marca grueso como con el foco: en noche y no en rojo (decisión 099). Sobre
// noche, en blanco, y el autocompletado del navegador no pinta el campo de celeste.
const CAMPO = {
  claro: 'border-borde-campo text-noche focus:border-noche aria-invalid:border-noche',
  noche:
    'border-borde-campo bg-noche-900 text-white focus:border-white aria-invalid:border-white autofill:shadow-[inset_0_0_0_1000px_var(--color-noche-900)] autofill:[-webkit-text-fill-color:var(--color-papel)]',
};

export function Campo({ id, rotulo, numerico = false, sufijo, sobreNoche = false, className = '', ...props }: Props) {
  const input = (
    <input
      id={id}
      className={`h-12 rounded-control border px-3.5 text-[15px] outline-none placeholder:text-pizarra-400 focus:border-2 focus:px-[13px] aria-invalid:border-2 aria-invalid:px-[13px] ${
        CAMPO[sobreNoche ? 'noche' : 'claro']
      } ${numerico ? 'font-mono tabular-nums' : ''}`}
      {...props}
    />
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className={`text-[13px] font-semibold ${sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'}`}>
        {rotulo}
      </label>
      {sufijo ? (
        <div className="relative flex flex-col">
          {input}
          <span
            className={`pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] ${
              sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'
            }`}
          >
            {sufijo}
          </span>
        </div>
      ) : (
        input
      )}
    </div>
  );
}
