import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import type { TorneoTerminado } from './tiposDeInicio';

// Cuántos se ven antes de desplegar el resto.
const VISIBLES = 5;

// Los torneos cerrados, del último al primero. Cada uno lleva a su cierre, con los campeones y los
// puntos (decisión 080). Sin un listado aparte, el resto se despliega en la misma tabla.
export function TablaTerminados({ torneos }: { torneos: TorneoTerminado[] }) {
  const [todos, setTodos] = useState(false);
  const visibles = todos ? torneos : torneos.slice(0, VISIBLES);

  return (
    <Tarjeta className="overflow-hidden">
      <table className="w-full table-fixed text-left text-[15px]">
        <thead className="bg-fondo-tabla text-[13px] text-gris-500">
          <tr>
            <th className="py-[11px] pr-2 pl-5 font-semibold">Torneo</th>
            <th className="w-[150px] px-2 py-[11px] font-semibold">Terminó</th>
            <th className="w-[190px] px-2 py-[11px] font-semibold">Campeón</th>
            <th className="w-[110px] py-[11px] pr-5 pl-2 text-right font-semibold">Jugadores</th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((torneo) => (
            <tr key={torneo.id} className="border-t border-linea-suave">
              <td className="truncate py-[13px] pr-2 pl-5 font-medium">
                <Link to={`/torneos/${torneo.id}/cierre`} className="hover:text-gris-500">
                  {torneo.nombre}
                </Link>
              </td>
              <td className="px-2 py-[13px]">
                <Numero className="text-sm text-gris-500">{torneo.termino ?? '—'}</Numero>
              </td>
              <td className="truncate px-2 py-[13px]">{torneo.campeon ?? '—'}</td>
              <td className="py-[13px] pr-5 pl-2 text-right">
                <Numero className="text-sm">{torneo.jugadores}</Numero>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!todos && torneos.length > VISIBLES && (
        <div className="border-t border-linea-suave px-5 py-[13px]">
          <button type="button" onClick={() => setTodos(true)} className="text-sm font-medium hover:text-gris-500">
            Ver los <Numero>{torneos.length}</Numero> torneos terminados →
          </button>
        </div>
      )}
    </Tarjeta>
  );
}
