import { Interruptor } from '../../components/Interruptor';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  jugadoresCarganResultados: boolean;
  alCambiar: (valor: boolean) => void;
};

// Quién carga los resultados (decisión 127): solo la organización, o también cada jugador desde la
// app, con la confirmación del rival. Toda organización arranca apagada, como POLENTA.
export function SeccionResultados({ jugadoresCarganResultados, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h2 id="resultados-titulo" className="text-[17px] font-semibold">
            Los jugadores cargan sus resultados
          </h2>
          <p className="max-w-[560px] text-sm leading-normal text-pizarra-500">
            Cada jugador carga el resultado de su partido desde la app, y cuenta cuando lo confirma el rival. Si el rival no tiene la
            app, lo confirmás vos desde el tablero. Vos seguís pudiendo cargar cualquier resultado, y el W.O. lo das solo vos.
          </p>
        </div>
        <Interruptor encendido={jugadoresCarganResultados} alCambiar={alCambiar} aria-labelledby="resultados-titulo" />
      </div>
    </Tarjeta>
  );
}
