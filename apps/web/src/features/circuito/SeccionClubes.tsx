import type { Club } from '@setpoint/shared';
import { Interruptor } from '../../components/Interruptor';
import { Tarjeta } from '../../components/Tarjeta';
import { TarjetaClub } from './TarjetaClub';

type Props = {
  // Apagarlo solo oculta la lista: los clubes cargados quedan guardados.
  usaClubes: boolean;
  clubes: Club[];
  alCambiarUsaClubes: (usaClubes: boolean) => void;
  alCambiar: (clubes: Club[]) => void;
};

// "Club 1", "Club 2"...: entra con nombre para que el circuito se pueda guardar, y se cambia ahí mismo.
function nombreDeClubNuevo(clubes: Club[]) {
  const usados = new Set(clubes.map((c) => c.nombre.toLowerCase()));
  let numero = clubes.length + 1;
  while (usados.has(`club ${numero}`)) numero += 1;
  return `Club ${numero}`;
}

export function SeccionClubes({ usaClubes, clubes, alCambiarUsaClubes, alCambiar }: Props) {
  function agregarClub() {
    alCambiar([...clubes, { nombre: nombreDeClubNuevo(clubes), direccion: '', canchas: [] }]);
  }

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h2 id="clubes-titulo" className="text-[17px] font-semibold">
            Clubes donde juegan
          </h2>
          <p className="text-sm text-gris-500">Es opcional. Cargalos solo si querés estadísticas por superficie.</p>
        </div>
        <Interruptor encendido={usaClubes} alCambiar={alCambiarUsaClubes} aria-labelledby="clubes-titulo" />
      </div>

      {usaClubes && clubes.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {clubes.map((club, i) => (
              // Por posición: un club nuevo no tiene id y el nombre cambia mientras se escribe.
              <TarjetaClub
                key={i}
                indice={i}
                club={club}
                alCambiar={(cambiado) => alCambiar(clubes.map((otro, j) => (j === i ? cambiado : otro)))}
                alQuitar={() => alCambiar(clubes.filter((_, j) => j !== i))}
              />
            ))}
          </ul>
          <button type="button" onClick={agregarClub} className="self-start text-sm font-medium hover:text-gris-500">
            Agregar otro club
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-gris-300 p-[18px] text-center">
          <p className="text-sm text-gris-500">
            {clubes.length > 0
              ? 'Con esto apagado, la sede de cada partido se escribe a mano. Los clubes que cargaste quedan guardados.'
              : 'Sin clubes cargados, la sede de cada partido se escribe a mano.'}
          </p>
          {usaClubes && (
            <button type="button" onClick={agregarClub} className="text-sm font-medium hover:text-gris-500">
              Agregar el primer club
            </button>
          )}
        </div>
      )}
    </Tarjeta>
  );
}
