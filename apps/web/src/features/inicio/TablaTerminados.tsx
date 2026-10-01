import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';
import type { TorneoTerminado } from './torneosEjemplo';

type Props = {
  torneos: TorneoTerminado[];
  // Cuántos terminados hay en total; la tabla muestra solo los últimos.
  total: number;
};

export function TablaTerminados({ torneos, total }: Props) {
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
          {torneos.map((torneo) => (
            <tr key={torneo.id} className="border-t border-linea-suave">
              <td className="truncate py-[13px] pr-2 pl-5 font-medium">{torneo.nombre}</td>
              <td className="px-2 py-[13px]">
                <Numero className="text-sm text-gris-500">{torneo.termino}</Numero>
              </td>
              <td className="truncate px-2 py-[13px]">{torneo.campeon}</td>
              <td className="py-[13px] pr-5 pl-2 text-right">
                <Numero className="text-sm">{torneo.jugadores}</Numero>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {total > torneos.length && (
        <div className="border-t border-linea-suave px-5 py-[13px]">
          {/* Se conecta cuando exista el listado de torneos. */}
          <button type="button" className="text-sm font-medium hover:text-gris-500">
            Ver los <Numero>{total}</Numero> torneos terminados →
          </button>
        </div>
      )}
    </Tarjeta>
  );
}
