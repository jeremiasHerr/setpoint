import type { Club } from '@setpoint/shared';
import { Boton } from '../../components/Boton';
import { Tarjeta } from '../../components/Tarjeta';
import { TarjetaClub } from './TarjetaClub';

type Props = {
  clubes: Club[];
  alCambiar: (clubes: Club[]) => void;
};

// "Club 1", "Club 2"...: entra con nombre para que el circuito se pueda guardar, y se cambia ahí mismo.
function nombreDeClubNuevo(clubes: Club[]) {
  const usados = new Set(clubes.map((c) => c.nombre.toLowerCase()));
  let numero = clubes.length + 1;
  while (usados.has(`club ${numero}`)) numero += 1;
  return `Club ${numero}`;
}

export function SeccionClubes({ clubes, alCambiar }: Props) {
  function agregarClub() {
    alCambiar([...clubes, { nombre: nombreDeClubNuevo(clubes), direccion: '', canchas: [] }]);
  }

  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-[5px]">
        <h2 id="clubes-titulo" className="text-[17px] font-semibold">
          Clubes donde juegan
        </h2>
        <p className="text-sm text-pizarra-500">
          {clubes.length > 0
            ? 'Es opcional. Si quitás todos los clubes, la sede de cada partido se escribe a mano.'
            : 'Es opcional. Cargalos solo si querés estadísticas por superficie.'}
        </p>
      </div>

      {clubes.length > 0 ? (
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
          <Boton className="self-start" onClick={agregarClub}>
            Agregar club
          </Boton>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-borde-campo p-[18px] text-center">
          <p className="text-sm text-pizarra-500">Sin clubes cargados, la sede de cada partido se escribe a mano.</p>
          <Boton onClick={agregarClub}>Agregar club</Boton>
        </div>
      )}
    </Tarjeta>
  );
}
