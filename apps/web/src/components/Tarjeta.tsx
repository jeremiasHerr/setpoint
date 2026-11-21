import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  variante?: 'comun' | 'noche';
};

export function Tarjeta({ variante = 'comun', className = '', ...props }: Props) {
  const estilo =
    variante === 'noche'
      ? 'rounded-superficie bg-noche p-[22px] text-white'
      : 'rounded-tarjeta border border-linea bg-papel text-noche';

  return <div className={`${estilo} ${className}`} {...props} />;
}
