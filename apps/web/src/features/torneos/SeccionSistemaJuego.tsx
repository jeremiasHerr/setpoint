import type { DatosConvocatoria } from '@setpoint/shared';
import { Chip } from '../../components/Chip';
import { Interruptor } from '../../components/Interruptor';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

type SistemaJuego = Pick<DatosConvocatoria, 'setsPorPartido' | 'puntoDeOro' | 'terceroSet' | 'puntosSuperTieBreak'>;

// Dos chips y no un interruptor: apagado, "al mejor de 3" quería decir "al mejor de 5", y no lo decía.
const OPCIONES_DE_SETS = [3, 5] as const;

type Props = SistemaJuego & {
  alCambiar: <K extends keyof SistemaJuego>(campo: K, valor: DatosConvocatoria[K]) => void;
};

export function SeccionSistemaJuego({ setsPorPartido, puntoDeOro, terceroSet, puntosSuperTieBreak, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Sistema de juego</h2>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span id="sets-titulo" className="text-[15px]">
            Partidos al mejor de
          </span>
          <div role="group" aria-labelledby="sets-titulo" className="flex gap-2">
            {OPCIONES_DE_SETS.map((sets) => (
              <Chip key={sets} activo={setsPorPartido === sets} onClick={() => alCambiar('setsPorPartido', sets)}>
                <Numero>{sets}</Numero>&nbsp;sets
              </Chip>
            ))}
          </div>
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
              {/* El set que define: el tercero, o el quinto a cinco sets. */}
              Super tie-break en lugar del {setsPorPartido === 5 ? 'quinto' : 'tercer'} set
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
