import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  rotulo: string;
  accesorio?: ReactNode;
};

export function CampoContrasena({ id, rotulo, accesorio, className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-gris-500">
          {rotulo}
        </label>
        {accesorio}
      </div>
      <div className="flex h-12 items-center gap-2.5 rounded-control border border-gris-300 pr-1.5 pl-3.5 focus-within:border-2 focus-within:border-negro focus-within:pr-[5px] focus-within:pl-[13px]">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-negro outline-none placeholder:text-gris-400"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-controls={id}
          aria-pressed={visible}
          className="h-9 rounded-lg px-2.5 text-[13px] font-medium text-gris-500 hover:bg-fondo hover:text-negro"
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>
  );
}
