import type { PartidoDeLaFicha } from '@setpoint/shared';
import { useState } from 'react';
import { Boton } from '../../components/Boton';
import { Numero } from '../../components/Numero';
import { NOMBRE_DEL_CUADRO, rotuloDeRonda } from '../cuadros/cuadro';

// Los últimos, y el resto se despliega en el lugar.
const VISIBLES = 5;

// "zona C", "final", o en el cuadro consuelo "semis · Cuadro consuelo".
function donde(partido: PartidoDeLaFicha) {
  if (partido.grupo) return `zona ${partido.grupo}`;
  const ronda = rotuloDeRonda(partido.ronda!, partido.rondas!);
  return partido.cuadro === 'complementaria' ? `${ronda} · ${NOMBRE_DEL_CUADRO.complementaria}` : ronda;
}

// Sus partidos con resultado, del más reciente al más viejo: el rival, dónde fue y el marcador desde
// su lado. El punto lima es un partido ganado. El W.O. figura aunque no cuente en jugados (decisión 073).
export function PartidosDeLaFicha({ partidos }: { partidos: PartidoDeLaFicha[] }) {
  const [todos, setTodos] = useState(false);
  const hayMas = partidos.length > VISIBLES;
  const visibles = todos ? partidos : partidos.slice(0, VISIBLES);

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[17px] font-semibold tracking-[-0.015em]">{hayMas && !todos ? 'Últimos partidos' : 'Partidos'}</h2>

      {partidos.length === 0 ? (
        <p className="text-[15px] text-gris-500">Todavía no tiene partidos con resultado.</p>
      ) : (
        <ul className="flex flex-col">
          {visibles.map((partido) => (
            <li
              key={partido.id}
              className="grid h-[52px] grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-b border-linea-suave last:border-b-0"
            >
              <span className={`size-[7px] rounded-full ${partido.gano ? 'bg-lima' : 'bg-linea'}`} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className={`truncate text-base ${partido.gano ? 'font-medium' : 'text-gris-700'}`}>
                  <span className="sr-only">{partido.gano ? 'Le ganó a ' : 'Perdió con '}</span>
                  {partido.rival.apellido}
                </span>
                <span className="truncate text-xs text-gris-500">
                  {partido.torneo} · {donde(partido)}
                </span>
              </div>
              <Numero className={`text-right text-sm ${partido.gano ? '' : 'text-gris-500'}`}>{partido.marcador}</Numero>
            </li>
          ))}
        </ul>
      )}

      {hayMas && !todos && (
        <Boton onClick={() => setTodos(true)}>
          {/* En un solo hijo: Boton separa sus hijos con gap. */}
          <span>
            Ver los <Numero>{partidos.length}</Numero> partidos
          </span>
        </Boton>
      )}
    </section>
  );
}
