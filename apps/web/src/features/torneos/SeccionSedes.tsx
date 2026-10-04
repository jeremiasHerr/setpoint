import type { DatosConvocatoria } from '@setpoint/shared';
import { Selector } from '../../components/Selector';
import { Tarjeta } from '../../components/Tarjeta';

type Sedes = Pick<DatosConvocatoria, 'sedeGrupos' | 'sedeEliminatorias'>;
type ModoSede = DatosConvocatoria['sedeGrupos'];

type Props = Sedes & {
  alCambiar: <K extends keyof Sedes>(campo: K, valor: DatosConvocatoria[K]) => void;
};

function Opciones() {
  return (
    <>
      <option value="libre">Lo eligen los jugadores</option>
      <option value="designada">La designa la organización</option>
    </>
  );
}

export function SeccionSedes({ sedeGrupos, sedeEliminatorias, alCambiar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <h2 className="text-[17px] font-semibold">Dónde se juega</h2>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Selector
          id="torneo-sede-grupos"
          rotulo="Fase de grupos"
          value={sedeGrupos}
          onChange={(e) => alCambiar('sedeGrupos', e.target.value as ModoSede)}
        >
          <Opciones />
        </Selector>
        <Selector
          id="torneo-sede-eliminatorias"
          rotulo="Eliminatorias"
          value={sedeEliminatorias}
          onChange={(e) => alCambiar('sedeEliminatorias', e.target.value as ModoSede)}
        >
          <Opciones />
        </Selector>
      </div>

      {/* El club de las eliminatorias (clubSede) se elige cuando exista el alta de clubes. */}
      <p className="text-sm text-gris-500">Todavía no se puede elegir el club: por ahora queda anotado quién define la sede.</p>
    </Tarjeta>
  );
}
