import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  // La negra es la acción que confirma; la común, todas las demás.
  principal?: boolean;
};

// La acción chica de cada fila de Inscripciones: "Dar de baja", "Recordarle", "Ya se lo devolví".
export function BotonAccion({ principal = false, type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      className={`flex h-8 shrink-0 items-center rounded-lg border px-3 text-[13px] whitespace-nowrap disabled:opacity-40 ${
        principal ? 'border-negro bg-negro font-semibold text-white' : 'border-linea text-gris-700 hover:bg-fondo'
      } ${className}`}
      {...props}
    />
  );
}
