import { Interruptor } from '../../components/Interruptor';
import { Tarjeta } from '../../components/Tarjeta';
import { ListaEditable } from './ListaEditable';

type Props = {
  usaRanking: boolean;
  etapas: string[];
  alCambiarUsaRanking: (usaRanking: boolean) => void;
  alCambiarEtapas: (etapas: string[]) => void;
};

export function SeccionRanking({ usaRanking, etapas, alCambiarUsaRanking, alCambiarEtapas }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h2 id="ranking-titulo" className="text-[17px] font-semibold">
            Ranking anual
          </h2>
          <p className="max-w-[560px] text-sm leading-normal text-gris-500">
            Cada torneo del calendario (Primavera, Verano…) da puntos según hasta dónde llegó cada jugador, y la tabla suma los de todos.
            Cuando el torneo vuelve al año siguiente, sus puntos nuevos reemplazan a los viejos: el ranking siempre refleja los últimos{' '}
            <span className="font-mono tabular-nums">12</span> meses.
          </p>
        </div>
        <Interruptor encendido={usaRanking} alCambiar={alCambiarUsaRanking} aria-labelledby="ranking-titulo" />
      </div>

      {/* El reemplazo es lo que menos se entiende: un ejemplo lo dice mejor que la regla. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control bg-fondo px-3.5 py-2.5 font-mono text-[13px] text-gris-500 tabular-nums">
        <span>
          Primavera 25: <span className="text-negro">50</span>
        </span>
        <span aria-hidden="true">→</span>
        <span>
          Primavera 26: <span className="text-negro">100</span>
        </span>
        <span className="text-gris-400">·</span>
        <span>
          el total sube <span className="text-negro">50</span>
        </span>
      </div>

      {usaRanking && (
        <>
          <div className="h-px bg-linea-suave" />
          <div className="flex flex-col gap-[11px]">
            <h3 className="text-[13px] font-semibold text-gris-500">Torneos del calendario</h3>
            <ListaEditable items={etapas} alCambiar={alCambiarEtapas} rotuloNuevo="Nombre del torneo" numerada />
            <p className="text-[13px] text-gris-500">
              Cada torneo del calendario es un casillero del ranking. Cuando se juega Primavera <span className="font-mono tabular-nums">26</span>, sus
              puntos reemplazan los de Primavera <span className="font-mono tabular-nums">25</span>.
            </p>
          </div>
        </>
      )}
    </Tarjeta>
  );
}
