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
          <p className="text-sm text-gris-500">Los torneos acumulan puntos y arman una tabla que se actualiza sola.</p>
        </div>
        <Interruptor encendido={usaRanking} alCambiar={alCambiarUsaRanking} aria-labelledby="ranking-titulo" />
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
