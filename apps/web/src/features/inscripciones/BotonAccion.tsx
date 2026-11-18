import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  // La de noche es la acción que confirma; la común, todas las demás.
  principal?: boolean;
};

// La acción chica de cada fila de Inscripciones: "Dar de baja", "Recordarle", "Ya se lo devolví".
export function BotonAccion({ principal = false, type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      className={`flex h-8 shrink-0 items-center rounded-lg border px-3 text-[13px] whitespace-nowrap disabled:opacity-40 ${
        principal ? 'border-noche bg-noche font-semibold text-white' : 'border-linea text-pizarra-700 hover:bg-niebla'
      } ${className}`}
      {...props}
    />
  );
}
