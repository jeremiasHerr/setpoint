import type { DatosConvocatoria } from '@setpoint/shared';
import { Interruptor } from '../../components/Interruptor';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type SistemaJuego = Pick<DatosConvocatoria, 'setsPorPartido' | 'puntoDeOro' | 'terceroSet' | 'puntosSuperTieBreak'>;

type Props = SistemaJuego & {
  alCambiar: <K extends keyof SistemaJuego>(campo: K, valor: DatosConvocatoria[K]) => void;
};

export function SeccionSistemaJuego({ setsPorPartido, puntoDeOro, terceroSet, puntosSuperTieBreak, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Sistema de juego</h2>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-4">
          <span id="mejor-de-3-titulo" className="text-[15px]">
            Partidos al mejor de <Numero>3</Numero> sets
          </span>
          {/* Apagado, se juega al mejor de 5. */}
          <Interruptor
            encendido={setsPorPartido === 3}
            alCambiar={(encendido) => alCambiar('setsPorPartido', encendido ? 3 : 5)}
            aria-labelledby="mejor-de-3-titulo"
          />
        </div>

        <div className="h-px bg-linea-suave" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-[3px]">
            <span id="punto-de-oro-titulo" className="text-[15px]">
              Punto de oro
            </span>
            <p className="text-sm text-gris-500">
              En <Numero>40-40</Numero> se juega un punto único, sin ventajas.
            </p>
          </div>
          <Interruptor
            encendido={puntoDeOro}
            alCambiar={(encendido) => alCambiar('puntoDeOro', encendido)}
            aria-labelledby="punto-de-oro-titulo"
          />
        </div>

        <div className="h-px bg-linea-suave" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-[3px]">
            <span id="super-tiebreak-titulo" className="text-[15px]">
              Super tie-break en lugar de tercer set
            </span>
            <p className="text-sm text-gris-500">
              A <Numero>{puntosSuperTieBreak}</Numero> puntos, sin diferencia.
            </p>
          </div>
          <Interruptor
            encendido={terceroSet === 'super_tiebreak'}
            alCambiar={(encendido) => alCambiar('terceroSet', encendido ? 'super_tiebreak' : 'set_completo')}
            aria-labelledby="super-tiebreak-titulo"
          />
        </div>
      </div>
    </Tarjeta>
  );
}
