import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  rotulo: string;
  accesorio?: ReactNode;
  // Dentro de una tarjeta noche, como el formulario de Ingresar (decisión 148).
  sobreNoche?: boolean;
};

export function CampoContrasena({ id, rotulo, accesorio, sobreNoche = false, className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className={`text-[13px] font-semibold ${sobreNoche ? 'text-pizarra-400' : 'text-pizarra-500'}`}>
          {rotulo}
        </label>
        {accesorio}
      </div>
      <div
        className={`flex h-12 items-center gap-2.5 rounded-control border border-borde-campo pr-1.5 pl-3.5 focus-within:border-2 focus-within:pr-[5px] focus-within:pl-[13px] ${
          sobreNoche ? 'bg-noche-900 focus-within:border-white' : 'focus-within:border-noche'
        }`}
      >
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-pizarra-400 ${
            sobreNoche
              ? 'text-white autofill:shadow-[inset_0_0_0_1000px_var(--color-noche-900)] autofill:[-webkit-text-fill-color:var(--color-papel)]'
              : 'text-noche'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-controls={id}
          aria-pressed={visible}
          className={`h-9 rounded-lg px-2.5 text-[13px] font-medium ${
            sobreNoche ? 'text-pizarra-400 hover:bg-noche-2 hover:text-white' : 'text-pizarra-500 hover:bg-niebla hover:text-noche'
          }`}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>
  );
}
