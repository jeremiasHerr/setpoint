import type { ReactNode } from 'react';
import { Tarjeta } from '../Tarjeta';
import { funcionalidades, type Icono } from './datosLanding';

const trazos: Record<Icono, ReactNode> = {
  zonas: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10M15 10v10" />
    </>
  ),
  cuadros: <path d="M4 6h5v12H4M15 4h5v6h-5M15 14h5v6h-5M9 12h6" />,
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  pago: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M2.5 10h19" />
    </>
  ),
  ranking: <path d="M4 19V9M10 19V5M16 19v-7M4 19h16" />,
  planilla: <path d="M5 4h14v16l-7-4-7 4z" />,
};

export function Funcionalidades() {
  return (
    <section className="flex flex-col gap-[26px] px-4 pt-3 pb-[72px] sm:px-10">
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">Lo que trae adentro</h2>

      <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {funcionalidades.map(({ icono, titulo, texto }) => (
          <Tarjeta key={titulo} className="flex flex-col gap-2.5 p-[22px]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-negro"
              aria-hidden="true"
            >
              {trazos[icono]}
            </svg>
            <h3 className="text-[17px] font-semibold">{titulo}</h3>
            <p className="text-[15px] leading-[1.45] text-gris-500">{texto}</p>
          </Tarjeta>
        ))}
      </div>
    </section>
  );
}
