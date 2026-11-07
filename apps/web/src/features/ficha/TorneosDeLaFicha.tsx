import { instancias, type Instancia, type InstanciaDeLaFicha, type TorneoDeLaFicha } from '@setpoint/shared';
import { Fragment, type ReactNode } from 'react';
import { Numero } from '../../components/Numero';
import { NOMBRE_DEL_CUADRO, rotuloDeRonda } from '../cuadros/cuadro';

// Con los mismos nombres que la tabla de puntos de Tu circuito: "Finalista", "Cuartos de final".
const etiqueta = (clave: Instancia) => instancias.find((i) => i.clave === clave)!.etiqueta;
const PERDIO_EN: Instancia[] = ['finalista', 'semifinalista', 'cuartos', 'octavos'];

// Hasta dónde llegó (decisión 072): "Finalista", "En semis", "Quedó en la zona".
function hastaDonde(instancia: InstanciaDeLaFicha) {
  if (instancia.tipo === 'zona') return instancia.enJuego ? 'En la zona' : 'Quedó en la zona';

  const { ronda, rondas } = instancia;
  if (instancia.campeon) return etiqueta('campeon');
  if (instancia.enJuego) {
    const enLaRonda = rotuloDeRonda(ronda, rondas);
    return enLaRonda === 'final' || enLaRonda.startsWith('ronda') ? `En la ${enLaRonda}` : `En ${enLaRonda}`;
  }
  const clave = PERDIO_EN[rondas - ronda];
  return clave ? etiqueta(clave) : `Ronda ${ronda}`;
}

// Debajo de la instancia: en el cuadro consuelo, el nombre del cuadro, y los puntos si los dio.
function debajo(torneo: TorneoDeLaFicha): ReactNode[] {
  const partes: ReactNode[] = [];
  if (torneo.instancia.tipo === 'cuadro' && torneo.instancia.cuadro === 'complementaria') partes.push(NOMBRE_DEL_CUADRO.complementaria);
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
export function TorneosDeLaFicha({ torneos }: { torneos: TorneoDeLaFicha[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Torneos</h2>
        {torneos.length > 0 && <Numero className="text-xs text-gris-400">{torneos.length}</Numero>}
      </div>

      {torneos.length === 0 ? (
        <p className="text-[15px] text-gris-500">Todavía no jugó ningún torneo en el circuito.</p>
      ) : (
        <ul className="flex flex-col">
          {torneos.map((torneo) => {
            const partes = debajo(torneo);
            return (
              <li
                key={torneo.torneoId}
                className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-linea-suave py-2 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-base font-medium">{torneo.nombre}</span>
                  <span className="text-xs text-gris-500">{torneo.categoria}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-right">
                  <span className="text-[15px]">{hastaDonde(torneo.instancia)}</span>
                  {partes.length > 0 && (
                    <span className="text-xs text-gris-500">
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
