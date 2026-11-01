import type { Tablero } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { TextoConNumeros } from '../resultados/AlGuardar';
import { queFalta } from './tablero';

// El panel negro: cuántos días quedan del plazo que corre y cuánto falta jugar.
export function ResumenPlazo({ tablero }: { tablero: Tablero }) {
  const { plazo, totales } = tablero;
  const vencido = plazo !== null && plazo.dias < 0;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-tarjeta bg-negro px-5 py-[18px]">
      <div className="flex flex-col gap-1.5">
        {plazo === null ? (
          <p className="text-[15px] font-medium text-white">Sin partidos pendientes</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gris-400">{vencido ? 'El plazo venció hace' : 'Te quedan'}</p>
            <p className="flex items-baseline gap-[9px]">
              <Numero className={`text-[46px] leading-[0.95] font-medium tracking-[-0.04em] ${vencido ? 'text-rojo' : 'text-lima'}`}>
                {Math.abs(plazo.dias)}
              </Numero>
              <span className="text-base text-gris-400">{Math.abs(plazo.dias) === 1 ? 'día' : 'días'}</span>
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[15px] leading-[1.4] text-white">
          <TextoConNumeros frase={queFalta(tablero)} />
        </p>
        <Numero className="text-[13px] text-gris-400">
          {totales.jugados} de {totales.partidos} jugados
        </Numero>
      </div>
    </div>
  );
}
