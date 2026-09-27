import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  activo?: boolean;
};

export function Chip({ activo = false, type = 'button', className = '', ...props }: Props) {
  return (
    <button
      type={type}
      aria-pressed={activo}
      className={`inline-flex h-[34px] items-center rounded-full border px-[13px] text-sm font-medium ${
        activo ? 'border-negro bg-negro text-white' : 'border-linea text-negro hover:bg-fondo'
      } ${className}`}
      {...props}
    />
  );
}
