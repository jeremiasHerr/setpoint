import type { FilaDeRanking, TorneoDelCalendario } from '@setpoint/shared';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { estadoParaLaFicha, type VueltaDeLaFicha } from '../ficha/vuelta';

type Props = {
  slug: string;
  filas: FilaDeRanking[];
  torneosDelCalendario: TorneoDelCalendario[];
  // A dónde vuelve la ficha: este ranking, en esta categoría (decisión 102).
  vuelta: VueltaDeLaFicha;
};

// El ranking en la compu, como la planilla con la que el circuito ya lo llevaba: una columna por
// torneo del calendario y el total al lado (decisión 155). En el celular sigue TablaRanking.
export function PlanillaRanking({ slug, filas, torneosDelCalendario, vuelta }: Props) {
  return (
    <table className="w-full max-w-[860px] border-collapse text-left">
      <thead>
        <tr className="border-b border-linea text-sm text-pizarra-500">
          <th scope="col" className="w-12 py-2 pr-3 text-right font-medium">
            Pos
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            Jugador
          </th>
          {torneosDelCalendario.map((torneo) => {
            const anios = [...new Set(filas.flatMap((f) => f.casilleros.filter((c) => c.etapaId === torneo.id).map((c) => c.anio)))].sort();
            return (
              <th
                key={torneo.id}
                scope="col"
                title={anios.length > 0 ? `${torneo.nombre} ${anios.join(' · ')}` : torneo.nombre}
                className="w-[72px] px-2 py-2 text-right font-medium"
              >
                {torneo.nombre.slice(0, 3).toLowerCase()}
              </th>
            );
          })}
          <th scope="col" className="w-[84px] py-2 pl-3 text-right font-medium">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.jugadorId} className="h-12 border-b border-linea-suave hover:bg-niebla">
            <td className="pr-3 text-right">
              <Numero className="text-sm text-pizarra-500">{fila.puesto}</Numero>
            </td>
            <td className="pr-4">
              <Link
                to={`/c/${slug}/jugadores/${fila.jugadorId}`}
                state={estadoParaLaFicha(vuelta)}
                className="text-lg font-medium text-noche underline-offset-[3px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-noche"
              >
                {fila.nombre} {fila.apellido}
              </Link>
            </td>
            {torneosDelCalendario.map((torneo) => {
              const casillero = fila.casilleros.find((c) => c.etapaId === torneo.id);
              return (
                <td key={torneo.id} className="px-2 text-right">
                  <Numero className={`text-base ${casillero ? 'text-noche' : 'text-pizarra-500'}`}>{casillero?.puntos ?? 0}</Numero>
                </td>
              );
            })}
            <td className="pl-3 text-right">
              <Numero className="text-lg font-semibold">{fila.puntos}</Numero>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
