import { Interruptor } from '../../components/Interruptor';
import { Tarjeta } from '../../components/Tarjeta';

type Props = {
  usaClubes: boolean;
  alCambiar: (usaClubes: boolean) => void;
  // El alta de clubes con canchas y superficies es otra pantalla: hasta que exista, el botón queda deshabilitado.
  alAgregarClub?: () => void;
};

export function SeccionClubes({ usaClubes, alCambiar, alAgregarClub }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h2 id="clubes-titulo" className="text-[17px] font-semibold">
            Clubes donde juegan
          </h2>
          <p className="text-sm text-gris-500">Es opcional. Cargalos solo si querés estadísticas por superficie.</p>
        </div>
        <Interruptor encendido={usaClubes} alCambiar={alCambiar} aria-labelledby="clubes-titulo" />
      </div>

      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-gris-300 p-[18px] text-center">
        <p className="text-sm text-gris-500">Sin clubes cargados, la sede de cada partido se escribe a mano.</p>
        {usaClubes && (
          <button
            type="button"
            onClick={alAgregarClub}
            disabled={!alAgregarClub}
            className="text-sm font-medium hover:text-gris-500 disabled:opacity-40"
          >
            Agregar el primer club
          </button>
        )}
      </div>
    </Tarjeta>
  );
}
