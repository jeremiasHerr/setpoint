import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  activo?: boolean;
};

// Filtros y opciones dentro de una pantalla (design.md §6). Son rectángulos con radio de control:
// las píldoras quedan para los estados, que no se tocan.
export function Chip({ activo = false, type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      aria-pressed={activo}
      className={`inline-flex h-[34px] items-center rounded-control border px-[13px] text-sm font-medium ${
        activo ? 'border-noche bg-noche font-semibold text-white' : 'border-linea bg-papel text-pizarra-700 hover:bg-linea-suave'
      } ${className}`}
      {...props}
    />
  );
}
