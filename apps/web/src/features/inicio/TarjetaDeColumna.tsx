import type { ReactNode } from 'react';
import { BarraDeMarcas } from '../../components/BarraDeMarcas';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  // A qué pertenece: "primavera", "torneo suelto" (decisión 094).
  calendario: string;
  nombre: string;
  detalle: string;
  etiqueta?: ReactNode;
  // Arriba a la derecha, en la fila de `calendario`: el engranaje para editar (decisión 101).
  esquina?: ReactNode;
  children?: ReactNode;
  acciones: ReactNode;
};

// La forma común de las tarjetas de las columnas del inicio.
export function TarjetaDeColumna({ calendario, nombre, detalle, etiqueta, esquina, children, acciones }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-3.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-linea-suave px-2 py-[3px] font-mono text-xs text-gris-700">{calendario}</span>
        {esquina}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-[-0.02em]">{nombre}</h3>
          {etiqueta}
        </div>
        <p className="text-[13px] text-gris-500">{detalle}</p>
      </div>
      {children}
      <div className="flex flex-wrap gap-2">{acciones}</div>
    </Tarjeta>
  );
}

// "Pagaron 28 / 32" con su barra: una marca por lugar del cupo.
export function CuentaDelCupo({ pagaron, cupo }: { pagaron: number; cupo: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="text-gris-700">Pagaron</span>
        <Numero className="text-sm font-medium">
          {pagaron} <span className="text-gris-400">/ {cupo}</span>
        </Numero>
      </div>
      <BarraDeMarcas
        rotulo={`${pagaron} de ${cupo} pagaron`}
        tramos={[
          { cantidad: pagaron, color: 'negro' },
          { cantidad: cupo - pagaron, color: 'linea' },
        ]}
      />
    </div>
  );
}
