import type { Importacion } from '@setpoint/shared';
import type { ReactNode } from 'react';
import { Numero } from '../../components/Numero';

// "Primavera, Verano e Invierno".
function enumerar(nombres: string[]) {
  return nombres.length <= 1 ? nombres.join('') : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
}

// Lo que la importación crea en el circuito al confirmar, dicho antes (decisiones 011 y 098): la
// categoría y los torneos del calendario que la planilla trae y el circuito no tiene, y el ranking.
export function LoQueSeCrea({ crea }: { crea: Importacion['crea'] }) {
  const partes: ReactNode[] = [];
  if (crea.categoria) {
    partes.push(
      <>
        la categoría <span className="font-semibold text-negro">{crea.categoria}</span>
      </>,
    );
  }
  if (crea.etapas.length > 0) {
    partes.push(
      crea.etapas.length === 1 ? (
        <>
          el torneo del calendario <span className="font-semibold text-negro">{crea.etapas[0]}</span>
        </>
      ) : (
        <>
          los <Numero>{crea.etapas.length}</Numero> torneos del calendario:{' '}
          <span className="font-semibold text-negro">{enumerar(crea.etapas)}</span>
        </>
      ),
    );
  }
  if (partes.length === 0 && !crea.ranking) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-tarjeta border border-linea bg-fondo px-[18px] py-4 text-[15px] leading-normal text-gris-700">
      {partes.length > 0 && (
        <p>
          Al importar, en tu circuito se crean {partes[0]}
          {partes[1] && <> y {partes[1]}</>}.
        </p>
      )}
      {crea.ranking && <p>También se activa el ranking, porque la planilla trae puntos.</p>}
    </div>
  );
}
