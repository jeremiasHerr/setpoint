import type { ReactNode } from 'react';
import { MARCA } from '../../../components/marcas';

// Las piezas chicas que se repiten en las pantallas del demo. Son dibujos del producto, no botones de verdad.

type BotonProps = {
  principal?: boolean;
  chico?: boolean;
  apretado?: boolean;
  tenue?: boolean;
  className?: string;
  children: ReactNode;
  // El guion apunta a este botón: se le registra el ref.
  refDelGuion?: (el: HTMLElement | null) => void;
};

export function BotonDelDemo({ principal, chico, apretado, tenue, className = '', children, refDelGuion }: BotonProps) {
  return (
    <span
      ref={refDelGuion}
      className={`inline-flex items-center whitespace-nowrap rounded-control border text-[14px] leading-none transition-transform duration-[120ms] ${
        chico ? 'h-8 px-3 text-[13px]' : 'h-10 px-4'
      } ${principal ? 'border-noche bg-noche font-semibold text-white' : 'border-linea bg-papel font-medium text-noche'} ${
        apretado ? 'scale-[.97]' : ''
      } ${tenue ? 'opacity-45' : ''} ${className}`}
    >
      {children}
    </span>
  );
}

// "sin fecha": la píldora punteada de un partido sin coordinar.
export function ChipSinFecha() {
  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-[9px] text-[12px] leading-none text-pizarra-500 ${MARCA.pendiente}`}
    >
      sin fecha
    </span>
  );
}

// La marca del logo, a los tamaños chicos del demo. Es el mismo dibujo que components/Logo.tsx.
export function MarcaDelLogo({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 63 53" className={`block flex-none text-white ${className}`} aria-hidden="true" focusable="false">
      <rect x="0" y="12" width="11" height="41" rx="2" fill="currentColor" />
      <rect x="17" y="12" width="11" height="41" rx="2" fill="currentColor" />
      <rect x="34" y="12" width="11" height="41" rx="2" fill="currentColor" />
      <rect x="52" y="0" width="11" height="41" rx="2" className="fill-pelota" />
    </svg>
  );
}

// Dos textos en el mismo lugar: se ve uno u otro sin que el ancho se mueva. Con `suave`, se funden.
export function Alternativa({
  cambia,
  a,
  b,
  suave = false,
}: {
  cambia: boolean;
  a: ReactNode;
  b: ReactNode;
  suave?: boolean;
}) {
  const celda = `col-start-1 row-start-1 ${suave ? 'transition-opacity duration-200' : ''}`;
  return (
    <span className="inline-grid">
      <span className={`${celda} ${cambia ? 'opacity-0' : ''}`}>{a}</span>
      <span className={`${celda} ${cambia ? '' : 'opacity-0'}`}>{b}</span>
    </span>
  );
}

// El número que gira: el viejo sale hacia arriba y entra el nuevo desde abajo.
export function Rueda({ nuevo, viejo, nuevoValor, chica }: { nuevo: boolean; viejo: string; nuevoValor: string; chica?: boolean }) {
  const celda = 'col-start-1 row-start-1 block transition-[transform,opacity] duration-[280ms] ease-[cubic-bezier(.2,.7,.2,1)]';
  return (
    <span
      className={`inline-grid overflow-hidden align-bottom font-mono font-medium tabular-nums text-noche [contain:paint] ${
        chica ? 'h-6 text-[20px] leading-6' : 'h-7 text-[22px] leading-7'
      }`}
    >
      <span className={`${celda} ${nuevo ? '-translate-y-full opacity-0' : ''}`}>{viejo}</span>
      <span className={`${celda} ${nuevo ? '' : 'translate-y-full opacity-0'}`}>{nuevoValor}</span>
    </span>
  );
}
