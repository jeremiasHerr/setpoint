import { superficies, type Cancha, type Club, type Superficie } from '@setpoint/shared';
import { Campo } from '../../components/Campo';

type Props = {
  // Posición en la lista: los ids de los campos salen de acá, porque un club nuevo todavía no tiene id.
  indice: number;
  club: Club;
  alCambiar: (club: Club) => void;
  alQuitar: () => void;
};

const estiloControl =
  'h-10 min-w-0 rounded-control border border-gris-300 bg-white px-3 text-sm text-negro outline-none focus:border-2 focus:border-negro focus:px-[11px]';

// "Cancha 1", "Cancha 2"...: el primer número que no esté usado en este club.
function nombreDeCanchaNueva(canchas: Cancha[]) {
  const usados = new Set(canchas.map((c) => c.nombre.toLowerCase()));
  let numero = canchas.length + 1;
  while (usados.has(`cancha ${numero}`)) numero += 1;
  return `Cancha ${numero}`;
}

export function TarjetaClub({ indice, club, alCambiar, alQuitar }: Props) {
  function cambiarCancha(posicion: number, cambios: Partial<Cancha>) {
    alCambiar({ ...club, canchas: club.canchas.map((c, i) => (i === posicion ? { ...c, ...cambios } : c)) });
  }

  function agregarCancha() {
    // Entra con nombre y superficie para que el circuito se pueda guardar sin completar nada más.
    const superficie = club.canchas.at(-1)?.superficie ?? 'polvo_ladrillo';
    alCambiar({ ...club, canchas: [...club.canchas, { nombre: nombreDeCanchaNueva(club.canchas), superficie }] });
  }

  return (
    <li className="flex flex-col gap-3.5 rounded-xl border border-linea p-4">
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Campo
          id={`club-${indice}-nombre`}
          rotulo="Club"
          maxLength={80}
          value={club.nombre}
          onChange={(e) => alCambiar({ ...club, nombre: e.target.value })}
        />
        <Campo
          id={`club-${indice}-direccion`}
          rotulo="Dirección — opcional"
          maxLength={120}
          value={club.direccion}
          onChange={(e) => alCambiar({ ...club, direccion: e.target.value })}
        />
        <button type="button" onClick={alQuitar} className="h-12 text-sm font-medium text-gris-500 hover:text-negro">
          Quitar club
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[13px] font-semibold text-gris-500">Canchas</h3>
        {club.canchas.length > 0 && (
          <ul className="flex flex-col gap-2">
            {club.canchas.map((cancha, i) => (
              <li key={i} className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
                <input
                  aria-label={`Nombre de la cancha ${i + 1}`}
                  maxLength={40}
                  value={cancha.nombre}
                  onChange={(e) => cambiarCancha(i, { nombre: e.target.value })}
                  className={estiloControl}
                />
                <select
                  aria-label={`Superficie de ${cancha.nombre}`}
                  value={cancha.superficie}
                  onChange={(e) => cambiarCancha(i, { superficie: e.target.value as Superficie })}
                  className={estiloControl}
                >
                  {superficies.map(({ clave, etiqueta }) => (
                    <option key={clave} value={clave}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => alCambiar({ ...club, canchas: club.canchas.filter((_, otra) => otra !== i) })}
                  className="justify-self-start text-sm font-medium text-gris-500 hover:text-negro"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={agregarCancha} className="self-start text-sm font-medium hover:text-gris-500">
          Agregar una cancha
        </button>
      </div>
    </li>
  );
}
