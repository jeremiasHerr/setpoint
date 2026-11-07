import type { Instancia, RankingDeLaFicha } from '@setpoint/shared';
import { Numero } from '../../components/Numero';
import { NOMBRE_DEL_CUADRO } from '../cuadros/cuadro';

// La barra más alta mide 100 px; una sin puntos queda como una línea.
const ALTO_MAXIMO = 100;
const ALTO_MINIMO = 2;

const principal = NOMBRE_DEL_CUADRO.campeonato;

// Qué hizo para sumar esos puntos: "Los 75 de Invierno 26 son de haber llegado a la final del Campeonato".
const QUE_HIZO: Record<Instancia, string> = {
  campeon: `ganado el ${principal}`,
  finalista: `llegado a la final del ${principal}`,
  semifinalista: `llegado a semis del ${principal}`,
  cuartos: `llegado a cuartos del ${principal}`,
  octavos: `llegado a octavos del ${principal}`,
  participacion: 'jugado el torneo',
};

// "pri", "ver": las tres primeras letras, como en la tabla del ranking.
const rotulo = (nombre: string) => nombre.slice(0, 3).toLowerCase();
const anioCorto = (anio: number) => String(anio).slice(-2);

// Una barra por torneo del calendario, con los puntos vigentes de cada casillero: se ve de un vistazo
// en qué torneo hizo su mejor resultado, que va en lima.
export function PuntosPorTorneo({ ranking }: { ranking: RankingDeLaFicha }) {
  const { torneosDelCalendario, casilleros } = ranking;
  if (torneosDelCalendario.length === 0) return null;

  const barras = torneosDelCalendario.map((torneo) => ({
    torneo,
    casillero: casilleros.find((c) => c.etapaId === torneo.id) ?? null,
  }));
  const maximo = Math.max(0, ...casilleros.map((c) => c.puntos));
  // Con un empate en el mejor, el primero del calendario.
  const mejor = maximo > 0 ? barras.find((b) => b.casillero?.puntos === maximo) : undefined;
  const anios = [...new Set(casilleros.map((c) => c.anio))].sort();
  const alto = (puntos: number) => (maximo > 0 ? Math.max(ALTO_MINIMO, Math.round((puntos / maximo) * ALTO_MAXIMO)) : ALTO_MINIMO);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Puntos por torneo del calendario</h2>
        {anios.length > 0 && <Numero className="shrink-0 text-xs text-gris-400">{anios.join(' · ')}</Numero>}
      </div>

      <ul
        className="grid h-[148px] items-end gap-2"
        style={{ gridTemplateColumns: `repeat(${barras.length}, minmax(0, 1fr))` }}
      >
        {barras.map(({ torneo, casillero }) => {
          const puntos = casillero?.puntos ?? 0;
          const esLaMejor = mejor?.torneo.id === torneo.id;
          return (
            <li
              key={torneo.id}
              title={casillero ? `${torneo.nombre} ${anioCorto(casillero.anio)}` : torneo.nombre}
              className="flex flex-col items-center gap-[7px]"
            >
              <Numero className={`text-[13px] ${esLaMejor ? 'font-semibold' : 'font-medium'} ${puntos > 0 ? '' : 'text-gris-400'}`}>
                {puntos}
              </Numero>
              <div className={`w-full rounded-t-[5px] ${esLaMejor ? 'bg-lima' : 'bg-linea'}`} style={{ height: alto(puntos) }} />
              <Numero className={`text-[11px] ${esLaMejor ? 'text-negro' : 'text-gris-500'}`}>{rotulo(torneo.nombre)}</Numero>
            </li>
          );
        })}
      </ul>

      {/* Los importados de la planilla no dicen de qué instancia salieron: ahí no hay nada que explicar. */}
      {mejor?.casillero?.instancia && (
        <p className="text-sm leading-[1.42] text-gris-500">
          Los <Numero>{mejor.casillero.puntos}</Numero> de {mejor.torneo.nombre} {anioCorto(mejor.casillero.anio)} son de haber{' '}
          {QUE_HIZO[mejor.casillero.instancia]}.
        </p>
      )}
    </section>
  );
}
