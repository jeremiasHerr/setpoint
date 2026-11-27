import type { JugadorDelCuadro, TorneoEnVivo } from '@setpoint/shared';
import { useState } from 'react';
import { ConCifras } from '../../components/Numero';
import { cuandoSeJuega, nombreDelCuadro, rondaEnCurso, rotuloDeRonda, tieneResultado } from '../cuadros/cuadro';
import { useCuadrosPublicos } from '../cuadros/useCuadrosPublicos';
import { elDiaYHora } from '../torneos/texto';

// Los partidos de zona que se muestran como próximos: los primeros del calendario.
const PROXIMOS_DE_ZONA = 4;

type PartidoProximo = {
  clave: string;
  // "Zona A", "Campeonato".
  donde: string;
  // El color del cuadro, como en sus chips: ámbar el Campeonato, petróleo el consuelo (design.md §3).
  marca: string;
  jugadores: string;
  cuando: string;
  conFecha: boolean;
  sede: string | null;
};

// Arriba de las pestañas del torneo en vivo, lo que viene (decisión 161): en los cuadros, la ronda
// que se está jugando de cada uno; en las zonas, los próximos partidos con fecha. Es lo primero que
// se busca al abrir el link desde el grupo. Sin nada por jugarse, no aparece.
export function LoProximo({ torneo, slug, id }: { torneo: TorneoEnVivo; slug: string; id: string }) {
  return torneo.hayCuadros ? <EnLosCuadros slug={slug} id={id} /> : <EnLasZonas torneo={torneo} />;
}

const nombre = (j: JugadorDelCuadro | null) => (j ? `${j.nombre} ${j.apellido}` : 'a definir');
const RONDA_CON_ARTICULO: Record<string, string> = { final: 'La final', semis: 'Las semis', cuartos: 'Los cuartos', octavos: 'Los octavos' };

function EnLosCuadros({ slug, id }: { slug: string; id: string }) {
  // La misma consulta que la pestaña Cuadros: se pide una sola vez.
  const cuadros = useCuadrosPublicos(slug, id);
  if (!cuadros.data) return null;

  const rondas: string[] = [];
  const partidos: PartidoProximo[] = cuadros.data.cuadros.flatMap((cuadro) => {
    const ronda = rondaEnCurso(cuadro);
    const porJugarse = cuadro.partidos.filter(
      (p) => p.ronda === ronda && !tieneResultado(p) && p.estado !== 'doble_walkover' && p.jugadorA !== null && p.jugadorB !== null,
    );
    if (porJugarse.length > 0) rondas.push(rotuloDeRonda(ronda, cuadro.rondas));
    return porJugarse.map((p) => ({
      clave: `c${p.id}`,
      donde: nombreDelCuadro(cuadro.cuadro, cuadros.data.nombreCuadroConsuelo),
      marca: cuadro.cuadro === 'campeonato' ? 'bg-ambar' : 'bg-petroleo',
      jugadores: `${nombre(p.jugadorA)} · ${nombre(p.jugadorB)}`,
      cuando: cuandoSeJuega(p),
      conFecha: p.fechaAcordada !== null && !p.plazoCumplido,
      sede: p.sede,
    }));
  });

  // "Las finales" si todos los cuadros están en la misma ronda; si no, "Los próximos partidos".
  const misma = rondas.length > 0 && rondas.every((r) => r === rondas[0]) ? rondas[0] : null;
  const titulo =
    misma === 'final' && rondas.length > 1
      ? 'Las finales'
      : misma
        ? (RONDA_CON_ARTICULO[misma] ?? 'Los próximos partidos')
        : 'Los próximos partidos';

  return <Pieza titulo={titulo} partidos={partidos} />;
}

function EnLasZonas({ torneo }: { torneo: TorneoEnVivo }) {
  // Se lee una vez, al abrir la página: no hace falta que la lista cambie sola mientras se mira.
  const [ahora] = useState(() => Date.now());
  // El calendario ya viene del más próximo al más lejano, con los jugados incluidos.
  const partidos: PartidoProximo[] = torneo.calendario
    .filter((p) => p.grupo !== null && p.fechaAcordada !== null && new Date(p.fechaAcordada).getTime() >= ahora)
    .filter((p) => !['jugada', 'walkover', 'abandono', 'doble_walkover', 'cancelada'].includes(p.estado))
    .slice(0, PROXIMOS_DE_ZONA)
    .map((p) => ({
      clave: `z${p.id}`,
      donde: `Zona ${p.grupo}`,
      marca: 'bg-azul',
      jugadores: `${nombre(p.jugadorA)} · ${nombre(p.jugadorB)}`,
      cuando: elDiaYHora(p.fechaAcordada!),
      conFecha: true,
      sede: p.sede,
    }));

  return <Pieza titulo="Los próximos partidos" partidos={partidos} />;
}

function Pieza({ titulo, partidos }: { titulo: string; partidos: PartidoProximo[] }) {
  if (partidos.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 rounded-[16px] border border-linea bg-papel p-[18px] lg:flex-row lg:items-center lg:gap-6">
      <div className="flex shrink-0 flex-col gap-0.5 lg:w-[180px]">
        <span className="text-[13px] font-medium text-pizarra-500">Lo próximo</span>
        <h2 className="text-xl leading-[1.15] font-display font-semibold tracking-[-0.02em]">{titulo}</h2>
      </div>
      <ul className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {partidos.map((p) => (
          <li key={p.clave} className="flex min-w-0 flex-col gap-1 border-linea sm:border-l sm:pl-4">
            <span className="flex items-center gap-2 text-[13px] text-pizarra-500">
              <span className={`size-[7px] rounded-full ${p.marca}`} aria-hidden />
              {p.donde}
            </span>
            <span className="truncate text-[15px] font-semibold" title={p.jugadores}>
              {p.jugadores}
            </span>
            <ConCifras className={`text-[14px] ${p.conFecha ? 'font-medium text-azul-texto' : 'text-pizarra-500'}`}>{p.cuando}</ConCifras>
            {p.sede && <span className="text-[13px] text-pizarra-500">{p.sede}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
