import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  variante?: 'comun' | 'negra';
};

export function Tarjeta({ variante = 'comun', className = '', ...props }: Props) {
  const estilo =
    variante === 'negra'
      ? 'rounded-superficie bg-negro p-[22px] text-white'
      : 'rounded-tarjeta border border-linea bg-white';

  return <div className={`${estilo} ${className}`} {...props} />;
}
