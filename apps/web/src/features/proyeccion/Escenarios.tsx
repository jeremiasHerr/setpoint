import type { EscenarioDeProyeccion, Instancia } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { nombreDelEscenario } from './escenario';

const puesto = (p: number | null) => (p === null ? '—' : `${p}º`);

type Props = {
  escenarios: EscenarioDeProyeccion[];
  // Con un solo escenario no hay nada que perder: va con su nombre, sin "Pierde…".
  definido: boolean;
  // Desde qué instancia queda primero: esa fila se marca.
  numeroUnoDesde: Instancia | null;
};

// "Si llega a…": una fila por instancia, con los puntos que da, cómo queda el acumulado y el puesto.
export function Escenarios({ escenarios, definido, numeroUnoDesde }: Props) {
  return (
    <div className="overflow-hidden rounded-tarjeta border border-linea bg-papel">
      <div className="grid h-[34px] grid-cols-[minmax(0,1fr)_76px_58px] items-center gap-x-3 border-b border-linea bg-niebla px-[18px]">
        <Numero className="text-[13px] text-pizarra-500">instancia</Numero>
        <Numero className="text-right text-[13px] text-pizarra-500">queda con</Numero>
        <Numero className="text-right text-[13px] text-pizarra-500">puesto</Numero>
      </div>
      <ul>
        {escenarios.map((e, i) => {
          const marcada = e.instancia === numeroUnoDesde;
          return (
            <li
              key={e.instancia}
              className={`grid min-h-[60px] grid-cols-[minmax(0,1fr)_76px_58px] items-center gap-x-3 border-b border-linea-suave px-[18px] py-2 last:border-b-0 ${marcada ? 'bg-lona-fondo' : ''}`}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className={`text-[17px] ${marcada ? 'font-semibold' : 'font-medium'}`}>
                  {nombreDelEscenario(e.instancia, i === 0 && !definido)}
                </span>
                <Numero className="text-[13px] text-pizarra-500">
                  {e.puntos} {e.puntos === 1 ? 'punto' : 'puntos'}
                </Numero>
              </div>
              <Numero className={`text-right text-[19px] ${marcada ? 'font-semibold' : 'font-medium'}`}>{e.acumulado}</Numero>
              <Numero className={`text-right text-[17px] ${marcada ? 'font-semibold text-noche' : 'font-medium text-pizarra-500'}`}>
                {puesto(e.puesto)}
              </Numero>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
