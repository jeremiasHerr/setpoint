// El cara a cara entre dos jugadores (F18). Lógica pura: recibe los partidos que jugaron entre ellos
// y sus torneos ya leídos. No toca la base.
import {
  superficies,
  type ClaveCuadro,
  type CruceEnSuperficie,
  type PartidoDelCaraACara,
  type ResumenDelCaraACara,
  type Superficie,
} from '@setpoint/shared';
import type { Superficie as SuperficiePrisma } from '@prisma/client';
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

// Dónde se jugó, para la superficie. Opcional: los partidos sin club ni cancha no la tienen.
export type SedeDelPartidoLeida = {
  cancha?: { superficie: SuperficiePrisma } | null;
  club?: { canchas: { superficie: SuperficiePrisma }[] } | null;
};

// La superficie de un partido (decisión 126). Si guardó la cancha, la de la cancha. Si no, la de su
// club, siempre que todas sus canchas sean de la misma: con canchas distintas no se sabe en cuál se
// jugó. Sin club, o con un club sin canchas cargadas, null.
export function superficieDelPartido(sede: SedeDelPartidoLeida): Superficie | null {
  if (sede.cancha) return sede.cancha.superficie.toLowerCase() as Superficie;
  const distintas = new Set(sede.club?.canchas.map((c) => c.superficie) ?? []);
  if (distintas.size !== 1) return null;
  return [...distintas][0]!.toLowerCase() as Superficie;
}

// El cruce en cada superficie con algún partido jugado, en el orden de `superficies`. Cuenta como
// el resumen: el W.O. no suma. Los partidos sin superficie solo entran en el total.
export function cruceEnCadaSuperficie(aId: number, partidos: (ConResultado & SedeDelPartidoLeida)[]): CruceEnSuperficie[] {
  const cruces: CruceEnSuperficie[] = [];
  for (const { clave } of superficies) {
    const resumen = resumenDelCaraACara(aId, partidos.filter((p) => superficieDelPartido(p) === clave));
    if (resumen.jugados === 0) continue;
    cruces.push({ superficie: clave, jugados: resumen.jugados, ganadosA: resumen.ganadosA, ganadosB: resumen.ganadosB });
  }
  return cruces;
}

// Los partidos con resultado entre A y B, del más reciente al más viejo, con el marcador desde el
// lado de A. `partidosDeCuadro` son todos los de cuadro de esos torneos, para nombrar la ronda.
export function partidosDelCaraACara(
  aId: number,
  torneos: TorneoDeLaFichaLeido[],
  partidos: (PartidoDeLaFichaLeido & SedeDelPartidoLeida)[],
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
        superficie: superficieDelPartido(p),
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
