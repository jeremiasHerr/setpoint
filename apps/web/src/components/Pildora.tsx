import type { ReactNode } from 'react';
import { MARCA } from './marcas';

type Props = { tono: 'sin-fecha' | 'fecha'; children?: ReactNode };

// Las píldoras de estado de un partido (design.md §6 y §7): "sin fecha", punteada como la marca
// pendiente, y la fecha acordada en azul. No se tocan: los filtros son chips.
export function Pildora({ tono, children }: Props) {
  const estilo = tono === 'fecha' ? 'bg-azul-fondo text-azul-texto' : `text-pizarra-500 ${MARCA.pendiente}`;
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-[9px] font-mono text-xs leading-none whitespace-nowrap tabular-nums ${estilo}`}>
      {children ?? 'sin fecha'}
    </span>
  );
}
