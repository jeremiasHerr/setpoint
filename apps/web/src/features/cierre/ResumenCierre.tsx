import type { CierreDelTorneo } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type Resumen = NonNullable<CierreDelTorneo['resumen']>;

function Dato({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-pizarra-400">{rotulo}</span>
      {children}
    </div>
  );
}

const separador = <div className="h-px bg-borde-noche" />;

// El panel noche: qué le pasa al ranking con el cierre.
export function ResumenCierre({ resumen, cerrado }: { resumen: Resumen; cerrado: boolean }) {
  const { numeroUno } = resumen;
  return (
    <Tarjeta variante="noche" className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold">{cerrado ? 'Con el cierre' : 'Después del cierre'}</h2>
      <div className="flex flex-col gap-[13px]">
        <Dato rotulo={cerrado ? 'Puntos repartidos' : 'Puntos a repartir'}>
          <Numero className="text-2xl font-medium tracking-[-0.02em] text-white">{resumen.puntosARepartir}</Numero>
        </Dato>
        {separador}
        <Dato rotulo={cerrado ? 'Cambiaron de puesto' : 'Cambian de puesto'}>
          <Numero className="text-2xl font-medium tracking-[-0.02em]">{resumen.cambianDePuesto}</Numero>
        </Dato>
        {numeroUno && (
          <>
            {separador}
            <Dato rotulo={numeroUno.esNuevo ? 'Nuevo número uno' : 'Sigue número uno'}>
              <span className="text-[15px] font-semibold">{numeroUno.apellido}</span>
            </Dato>
          </>
        )}
      </div>
      <p className="text-[13px] leading-[1.45] text-pizarra-400">
        {cerrado
          ? 'El ranking público ya tiene estos puntos. Si corregís un resultado, se recalculan solos.'
          : 'El ranking público se actualiza al instante. Si después corregís un resultado, los puntos se recalculan.'}
      </p>
    </Tarjeta>
  );
}
