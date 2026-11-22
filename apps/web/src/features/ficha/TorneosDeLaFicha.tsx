import type { TorneoDeLaFicha } from '@setpoint/shared';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Numero } from '../../components/Numero';
import { hastaDonde } from './hastaDonde';

// Debajo de la instancia: en el cuadro consuelo, el nombre del cuadro, y los puntos si los dio.
function debajo(torneo: TorneoDeLaFicha, consuelo: string): ReactNode[] {
  const partes: ReactNode[] = [];
  if (torneo.instancia.tipo === 'cuadro' && torneo.instancia.cuadro === 'complementaria') partes.push(consuelo);
  if (torneo.puntos !== null) {
    partes.push(
      <>
        <Numero>{torneo.puntos}</Numero> {torneo.puntos === 1 ? 'punto' : 'puntos'}
      </>,
    );
  }
  return partes;
}

// Cada torneo que jugó, del más reciente al más viejo: hasta dónde llegó y cuántos puntos le dio.
// La pantalla de referencia no tiene esta sección: está armada con las piezas de la ficha (decisión 071).
// En el torneo que se está jugando y da puntos, el link a qué tiene en juego (F20, decisión 131).
type Props = { torneos: TorneoDeLaFicha[]; consuelo: string; slug: string; jugadorId: number };

export function TorneosDeLaFicha({ torneos, consuelo, slug, jugadorId }: Props) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Torneos</h2>
        {torneos.length > 0 && <Numero className="text-xs text-pizarra-400">{torneos.length}</Numero>}
      </div>

      {torneos.length === 0 ? (
        <p className="text-[15px] text-pizarra-500">Todavía no jugó ningún torneo en el circuito.</p>
      ) : (
        <ul className="flex flex-col">
          {torneos.map((torneo) => {
            const partes = debajo(torneo, consuelo);
            return (
              <li
                key={torneo.torneoId}
                className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-linea-suave py-2 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-base font-medium">{torneo.nombre}</span>
                  <span className="text-xs text-pizarra-500">{torneo.categoria}</span>
                  {torneo.conProyeccion && (
                    <Link
                      to={`/c/${slug}/torneos/${torneo.torneoId}/en-juego/${jugadorId}`}
                      className="self-start py-1 text-sm font-medium text-noche underline underline-offset-2 hover:text-pizarra-700"
                    >
                      Ver qué tiene en juego
                    </Link>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5 text-right">
                  <span className="text-[15px]">{hastaDonde(torneo.instancia)}</span>
                  {partes.length > 0 && (
                    <span className="text-xs text-pizarra-500">
                      {partes.map((parte, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' · '}
                          {parte}
                        </Fragment>
                      ))}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
