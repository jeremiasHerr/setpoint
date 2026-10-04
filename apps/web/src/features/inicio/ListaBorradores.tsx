import { Link } from 'react-router-dom';
import { Tarjeta } from '../../components/Tarjeta';
import type { TorneoEnBorrador } from './torneosEjemplo';

// Los borradores no los ve ningún jugador: lo único que se puede hacer con ellos es terminarlos.
export function ListaBorradores({ torneos }: { torneos: TorneoEnBorrador[] }) {
  return (
    <Tarjeta className="overflow-hidden">
      <ul>
        {torneos.map((torneo, i) => (
          <li
            key={torneo.id}
            className={`flex flex-wrap items-center justify-between gap-3 px-5 py-[13px] ${i > 0 ? 'border-t border-linea-suave' : ''}`}
          >
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="truncate text-[15px] font-medium">{torneo.nombre}</span>
              <span className="text-[13px] text-gris-500">{torneo.detalle}</span>
            </div>
            <Link to={`/torneos/${torneo.id}`} className="shrink-0 text-sm font-medium hover:text-gris-500">
              Seguir editando →
            </Link>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
