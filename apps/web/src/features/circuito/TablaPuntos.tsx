import { Tarjeta } from '../../components/Tarjeta';
import { instancias, type Instancia } from '@setpoint/shared';

type Props = {
  puntos: Record<Instancia, number>;
  alCambiar: (instancia: Instancia, puntos: number) => void;
};

export function TablaPuntos({ puntos, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Puntos por instancia</h2>

      {/* Se llena por columnas: de campeón a semifinalista a la izquierda, el resto a la derecha. */}
      <div className="grid gap-x-[22px] gap-y-3.5 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3">
        {instancias.map(({ clave, etiqueta }) => (
          <div key={clave} className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3">
            <label htmlFor={`puntos-${clave}`} className="text-[15px]">
              {etiqueta}
            </label>
            <input
              id={`puntos-${clave}`}
              type="number"
              inputMode="numeric"
              min={0}
              value={puntos[clave]}
              onChange={(e) => alCambiar(clave, Math.max(0, Number(e.target.value) || 0))}
              className="h-12 rounded-control border border-gris-300 px-3.5 text-right font-mono text-[15px] font-medium tabular-nums outline-none focus:border-2 focus:border-negro focus:px-[13px]"
            />
          </div>
        ))}
      </div>

      <p className="text-[13px] text-gris-500">Participación la recibe todo el que completa la fase de grupos sin clasificar a Campeonato.</p>
    </Tarjeta>
  );
}
