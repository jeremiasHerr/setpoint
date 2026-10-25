import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';

// Piezas de Revisar vinculación (docs/pantallas/organizador/revisar-vinculacion.html).

// La marca es un chip con borde negro, no rojo: no venció nada (design.md §7).
export function MarcaParaRevisar() {
  return (
    <span className="inline-flex h-[22px] items-center rounded-full border border-negro px-2 font-mono text-[11px] whitespace-nowrap">
      para revisar
    </span>
  );
}

export function Rotulo({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[11px] text-gris-500">{children}</span>;
}

export function Dato({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="whitespace-nowrap text-gris-500">{rotulo}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export function Cifra({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-fondo-tabla px-3 py-[11px]">
      <Rotulo>{rotulo}</Rotulo>
      <Numero className="text-xl font-medium">{valor}</Numero>
    </div>
  );
}

// El caso, arriba: qué pasó y qué se decide.
export function Planteo({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <section className="flex flex-col gap-[18px] rounded-[16px] border-2 border-negro px-6 py-[22px]">
      <h2 className="text-xl leading-[1.3] font-semibold tracking-[-0.02em]">{titulo}</h2>
      {children}
    </section>
  );
}

// Una salida que no es ninguna de las dos tarjetas: "No es ninguno de los dos", "No sabés de quién es".
export function OtraSalida({ titulo, children, accion }: { titulo: string; children: ReactNode; accion: ReactNode }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-5 rounded-tarjeta border border-linea px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-[15px] font-semibold">{titulo}</h3>
        <p className="text-sm text-gris-500">{children}</p>
      </div>
      <div className="shrink-0">{accion}</div>
    </section>
  );
}
