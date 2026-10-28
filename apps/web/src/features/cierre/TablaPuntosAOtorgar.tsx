import type { CierreDelTorneo, FilaDelCierre, Instancia } from '@setpoint/shared';
import { useState } from 'react';
import { Numero } from '../../components/Numero';
import { Tarjeta } from '../../components/Tarjeta';

// Las primeras filas, que son las instancias más altas. El resto, con "Ver todos".
const VISIBLES = 6;

const ETIQUETA: Record<Instancia, string> = {
  campeon: 'Campeón',
  finalista: 'Finalista',
  semifinalista: 'Semifinalista',
  cuartos: 'Cuartos',
  octavos: 'Octavos',
  participacion: 'Participación',
};

const ESTILO: Partial<Record<Instancia, string>> = {
  campeon: 'bg-lima',
  participacion: 'border border-linea bg-fondo',
};

function ChipInstancia({ instancia }: { instancia: Instancia }) {
  return (
    <span className={`inline-flex h-[30px] items-center rounded-full px-[11px] text-[13px] font-medium ${ESTILO[instancia] ?? 'bg-linea-suave'}`}>
      {ETIQUETA[instancia]}
    </span>
  );
}

// "10 → 100": lo de antes en gris, lo de ahora destacado.
function Cambio({ antes, despues, sufijo = '' }: { antes: number | null; despues: number | null; sufijo?: string }) {
  const valor = (n: number | null) => (n === null ? '—' : `${n}${sufijo}`);
  return (
    <Numero>
      <span className="text-gris-400">{valor(antes)}</span> <span className="text-gris-500">→</span>{' '}
      <span className="font-semibold">{valor(despues)}</span>
    </Numero>
  );
}

// Con ranking: jugador, instancia, casillero, acumulado y puesto. Sin ranking, las posiciones finales.
const COLUMNAS_CON_RANKING = 'grid-cols-[minmax(0,1fr)_132px_96px] md:grid-cols-[minmax(0,1fr)_150px_130px_88px_120px]';
const COLUMNAS_SIN_RANKING = 'grid-cols-[minmax(0,1fr)_150px]';

function Fila({ fila, columnas }: { fila: FilaDelCierre; columnas: string }) {
  const { ranking } = fila;
  return (
    <div className={`grid h-[54px] items-center gap-x-4 border-b border-linea-suave px-[18px] ${columnas}`}>
      <span className="truncate text-base font-medium">
        {fila.nombre} {fila.apellido}
      </span>
      <span>
        <ChipInstancia instancia={fila.instancia} />
      </span>
      {ranking && (
        <>
          <span className="hidden text-sm md:block">
            <Cambio antes={ranking.reemplaza} despues={ranking.puntos} />
          </span>
          <Numero className="hidden text-right text-base font-semibold md:block">{ranking.acumulado}</Numero>
          <span className="text-right text-sm">
            <Cambio antes={ranking.puestoAntes} despues={ranking.puestoDespues} sufijo="º" />
          </span>
        </>
      )}
    </div>
  );
}

export function TablaPuntosAOtorgar({ cierre }: { cierre: CierreDelTorneo }) {
  const [todos, setTodos] = useState(false);
  const conRanking = cierre.torneoDelCalendario !== null;
  const columnas = conRanking ? COLUMNAS_CON_RANKING : COLUMNAS_SIN_RANKING;
  const visibles = todos ? cierre.filas : cierre.filas.slice(0, VISIBLES);
  const rotulo = 'font-mono text-[11px] text-gris-500';

  const titulo = !conRanking ? 'Posiciones finales' : cierre.cerrado ? 'Puntos otorgados' : 'Puntos que se van a otorgar';

  return (
    <Tarjeta className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-linea px-[18px] py-4">
        <h2 className="text-[17px] font-semibold">{titulo}</h2>
        <p className="font-mono text-[13px] text-gris-500">
          <Numero>{cierre.filas.length}</Numero> jugadores
          {conRanking && ` · casillero ${cierre.torneoDelCalendario!.toLowerCase()}`}
        </p>
      </div>

      <div className={`grid h-[38px] items-center gap-x-4 border-b border-linea bg-fondo-tabla px-[18px] ${columnas}`}>
        <span className={rotulo}>jugador</span>
        <span className={rotulo}>instancia</span>
        {conRanking && (
          <>
            <span className={`hidden md:block ${rotulo}`}>reemplaza</span>
            <span className={`hidden text-right md:block ${rotulo}`}>acumulado</span>
            <span className={`text-right ${rotulo}`}>ranking</span>
          </>
        )}
      </div>

      {visibles.map((fila) => (
        <Fila key={fila.jugadorId} fila={fila} columnas={columnas} />
      ))}

      {cierre.filas.length > VISIBLES && (
        <div className="flex items-center justify-between gap-4 bg-fondo-tabla px-[18px] py-[15px]">
          <span className="font-mono text-[13px] text-gris-500">
            mostrando <Numero>{visibles.length}</Numero> de <Numero>{cierre.filas.length}</Numero>
          </span>
          <button type="button" aria-expanded={todos} onClick={() => setTodos(!todos)} className="text-sm font-medium">
            {todos ? 'Ver menos' : 'Ver todos'}
          </button>
        </div>
      )}
    </Tarjeta>
  );
}
