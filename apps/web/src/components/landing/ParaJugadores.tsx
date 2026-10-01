import { Numero } from '../Numero';
import { Tarjeta } from '../Tarjeta';
import { proximoPartidoEjemplo } from './datosLanding';

export function ParaJugadores() {
  return (
    <section id="para-jugadores" className="px-4 pb-[72px] sm:px-10">
      <div className="grid items-center gap-12 rounded-[20px] bg-fondo p-6 sm:p-11 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <h2 className="text-[32px] leading-[1.12] font-semibold tracking-[-0.035em]">
            Para el jugador, una app en el teléfono
          </h2>
          <p className="text-[17px] leading-normal text-gris-700">
            Ve su próximo partido con rival, club, día y hora. Anota la fecha que arregló y su rival la confirma con un
            toque. Y por primera vez tiene su historial: cuántos ganó, contra quién, y si alguna vez le ganó al que le
            toca el sábado.
          </p>
          <p className="text-base text-gris-500">
            Para mirar el ranking, los cuadros o una ficha no hace falta cuenta ni instalar nada: es un link.
          </p>
        </div>

        <Tarjeta variante="negra" className="flex flex-col gap-3.5">
          <span className="text-[13px] text-gris-400">Tu próximo partido</span>
          <span className="text-[26px] leading-[1.1] font-semibold tracking-[-0.03em]">
            {proximoPartidoEjemplo.rival}
          </span>
          <Numero className="text-[17px] text-lima">{proximoPartidoEjemplo.fecha}</Numero>
          <span className="text-sm text-gris-400">{proximoPartidoEjemplo.lugar}</span>
        </Tarjeta>
      </div>
    </section>
  );
}
