// El cara a cara entre dos jugadores (F18). Lógica pura: recibe los partidos que jugaron entre ellos
// y sus torneos ya leídos. No toca la base.
import type { ClaveCuadro, PartidoDelCaraACara, ResumenDelCaraACara } from '@setpoint/shared';
import { marcador, rondasDeLosCuadros } from '../jugador/mis-partidos';
import {
  ordenDeTorneos,
  ordenEnElTorneo,
  type PartidoDeCuadroLeido,
  type PartidoDeLaFichaLeido,
  type TorneoDeLaFichaLeido,
} from './ficha';

const CON_RESULTADO = ['JUGADA', 'WALKOVER', 'ABANDONO'];
type ConResultado = Pick<PartidoDeLaFichaLeido, 'estado' | 'ganadorId'>;
const tieneResultado = (p: ConResultado) => CON_RESULTADO.includes(p.estado) && p.ganadorId !== null;

// Ganados por cada uno. Como en la ficha, el W.O. no cuenta porque no se jugó y el abandono sí
// (decisión 073). Los partidos tienen que ser todos entre A y B.
export function resumenDelCaraACara(aId: number, partidos: ConResultado[]): ResumenDelCaraACara {
  const conResultado = partidos.filter(tieneResultado);
  const jugados = conResultado.filter((p) => p.estado !== 'WALKOVER');
  const ganadosA = jugados.filter((p) => p.ganadorId === aId).length;
  return {
    jugados: jugados.length,
    ganadosA,
    ganadosB: jugados.length - ganadosA,
    walkovers: conResultado.length - jugados.length,
  };
}

// Los partidos con resultado entre A y B, del más reciente al más viejo, con el marcador desde el
// lado de A. `partidosDeCuadro` son todos los de cuadro de esos torneos, para nombrar la ronda.
export function partidosDelCaraACara(
  aId: number,
  torneos: TorneoDeLaFichaLeido[],
  partidos: PartidoDeLaFichaLeido[],
  partidosDeCuadro: PartidoDeCuadroLeido[],
): PartidoDelCaraACara[] {
  const lista: PartidoDelCaraACara[] = [];

  for (const torneo of [...torneos].sort(ordenDeTorneos)) {
    const rondasPorCuadro = rondasDeLosCuadros(partidosDeCuadro.filter((p) => p.torneoId === torneo.id));
    const delTorneo = partidos.filter((p) => p.torneoId === torneo.id && tieneResultado(p));

    for (const p of delTorneo.sort(ordenEnElTorneo)) {
      lista.push({
        id: p.id,
        torneoId: torneo.id,
        torneo: torneo.edicion ?? torneo.nombre,
        grupo: p.cuadro ? null : p.grupo,
        cuadro: (p.cuadro?.toLowerCase() ?? null) as ClaveCuadro | null,
        ronda: p.cuadro ? p.ronda : null,
        rondas: p.cuadro ? (rondasPorCuadro.get(p.cuadro) ?? null) : null,
        estado: p.estado.toLowerCase() as PartidoDelCaraACara['estado'],
        ganador: p.ganadorId === aId ? 'a' : 'b',
        marcador: marcador(p, p.jugadorAId === aId),
      });
    }
  }
  return lista;
}

// Contra quiénes tiene partidos con resultado, de más a menos partidos y, a igual cantidad, por id.
// Los partidos tienen que ser todos del jugador.
export function rivalesConPartidos(
  jugadorId: number,
  partidos: Pick<PartidoDeLaFichaLeido, 'estado' | 'ganadorId' | 'jugadorAId' | 'jugadorBId'>[],
) {
  const cuenta = new Map<number, number>();
  for (const p of partidos) {
    if (!tieneResultado(p)) continue;
    const rival = p.jugadorAId === jugadorId ? p.jugadorBId : p.jugadorAId;
    if (rival === null) continue;
    cuenta.set(rival, (cuenta.get(rival) ?? 0) + 1);
  }
  return [...cuenta]
    .map(([rivalId, cantidad]) => ({ rivalId, partidos: cantidad }))
    .sort((x, y) => y.partidos - x.partidos || x.rivalId - y.rivalId);
}
