// La ficha pública del jugador (F17). Lógica pura: recibe sus partidos, sus torneos y sus
// movimientos ya leídos. No toca la base.
import {
  instancias,
  type Casillero,
  type CasilleroDeLaFicha,
  type ClaveCuadro,
  type Instancia,
  type InstanciaDeLaFicha,
  type PartidoDeLaFicha,
  type RecordDelJugador,
  type TorneoDeLaFicha,
} from '@setpoint/shared';
import type { EstadoPartido } from '../competencia/clasificacion';
import { marcador, rondasDeLosCuadros } from '../jugador/mis-partidos';
import { casillerosVigentes, type MovimientoDeRanking } from '../ranking/ranking';

type CuadroLeido = 'CAMPEONATO' | 'COMPLEMENTARIA';
type JugadorLeido = { id: number; nombre: string; apellido: string };

export type PartidoDeLaFichaLeido = {
  id: number;
  torneoId: number;
  grupo: string | null;
  cuadro: CuadroLeido | null;
  ronda: number | null;
  jugadorAId: number | null;
  jugadorBId: number | null;
  ganadorId: number | null;
  estado: EstadoPartido;
  fechaAcordada: Date | null;
  jugadorA: JugadorLeido | null;
  jugadorB: JugadorLeido | null;
  sets: { gamesA: number; gamesB: number }[];
};

export type TorneoDeLaFichaLeido = {
  id: number;
  nombre: string;
  edicion: string | null;
  categoria: { nombre: string };
  fechaInicio: Date | null;
  creadoEn: Date;
  gruposCerrados: boolean;
};

// Un partido de cuadro de cualquier jugador del torneo: hace falta para saber cuántas rondas tiene.
export type PartidoDeCuadroLeido = { torneoId: number; cuadro: CuadroLeido | null; ronda: number | null };

type ConResultado = Pick<PartidoDeLaFichaLeido, 'estado' | 'ganadorId'>;
const CON_RESULTADO: EstadoPartido[] = ['JUGADA', 'WALKOVER', 'ABANDONO'];
const tieneResultado = (p: ConResultado) => CON_RESULTADO.includes(p.estado) && p.ganadorId !== null;

// Jugados, ganados y perdidos. El W.O. no cuenta, porque no se jugó; el abandono sí, porque
// empezó (decisión 073). Los partidos tienen que ser todos del jugador.
export function recordDelJugador(jugadorId: number, partidos: ConResultado[]): RecordDelJugador {
  const conResultado = partidos.filter(tieneResultado);
  const jugados = conResultado.filter((p) => p.estado !== 'WALKOVER');
  const ganados = jugados.filter((p) => p.ganadorId === jugadorId).length;
  return {
    jugados: jugados.length,
    ganados,
    perdidos: jugados.length - ganados,
    walkovers: conResultado.length - jugados.length,
  };
}

// Hasta dónde llegó en un torneo, con sus partidos de ese torneo (decisión 072). Lo dice su último
// partido de cuadro: si no tiene resultado, lo está jugando; si lo perdió, quedó ahí; si ganó la
// final, salió campeón. Sin partidos de cuadro, quedó en la zona, o la zona todavía se juega.
export function instanciaEnElTorneo(
  jugadorId: number,
  partidos: Pick<PartidoDeLaFichaLeido, 'cuadro' | 'ronda' | 'estado' | 'ganadorId'>[],
  rondasPorCuadro: Map<string, number>,
  gruposCerrados: boolean,
): InstanciaDeLaFicha {
  const deCuadro = partidos.filter((p) => p.cuadro !== null && p.ronda !== null && p.estado !== 'CANCELADA');
  if (deCuadro.length === 0) return { tipo: 'zona', enJuego: !gruposCerrados };

  const ultimo = deCuadro.reduce((a, b) => (b.ronda! > a.ronda! ? b : a));
  const rondas = rondasPorCuadro.get(ultimo.cuadro!) ?? ultimo.ronda!;
  const base = { tipo: 'cuadro', cuadro: ultimo.cuadro!.toLowerCase() as ClaveCuadro, rondas } as const;

  if (!tieneResultado(ultimo)) return { ...base, ronda: ultimo.ronda!, campeon: false, enJuego: true };
  const gano = ultimo.ganadorId === jugadorId;
  // Ganó y no era la final: espera al rival en la ronda siguiente.
  if (gano && ultimo.ronda! < rondas) return { ...base, ronda: ultimo.ronda! + 1, campeon: false, enJuego: true };
  return { ...base, ronda: ultimo.ronda!, campeon: gano, enJuego: false };
}

// Del más reciente al más viejo: por la fecha de inicio, o por cuándo se creó si no tiene.
const ordenDeTorneos = (a: TorneoDeLaFichaLeido, b: TorneoDeLaFichaLeido) =>
  (b.fechaInicio ?? b.creadoEn).getTime() - (a.fechaInicio ?? a.creadoEn).getTime() || b.id - a.id;

// Dentro de un torneo, del más reciente al más viejo. No se guarda cuándo se cargó cada resultado:
// los cuadros van después de la zona y cada ronda después de la anterior; en la zona, por la fecha
// que anotaron, y los que no tienen, al final.
const ordenEnElTorneo = (a: PartidoDeLaFichaLeido, b: PartidoDeLaFichaLeido) =>
  (b.ronda ?? 0) - (a.ronda ?? 0) ||
  (b.fechaAcordada?.getTime() ?? 0) - (a.fechaAcordada?.getTime() ?? 0) ||
  b.id - a.id;

// Sus torneos, con la instancia y los puntos, y sus partidos con resultado, los dos del más reciente
// al más viejo. `partidos` son los del jugador; `partidosDeCuadro`, todos los de cuadro de esos
// torneos; `puntosPorTorneo`, los que le dio cada cierre.
export function historialDelJugador(
  jugadorId: number,
  torneos: TorneoDeLaFichaLeido[],
  partidos: PartidoDeLaFichaLeido[],
  partidosDeCuadro: PartidoDeCuadroLeido[],
  puntosPorTorneo: Map<number, number>,
): { torneos: TorneoDeLaFicha[]; partidos: PartidoDeLaFicha[]; record: RecordDelJugador } {
  const historial = { torneos: [] as TorneoDeLaFicha[], partidos: [] as PartidoDeLaFicha[] };

  for (const torneo of [...torneos].sort(ordenDeTorneos)) {
    const nombre = torneo.edicion ?? torneo.nombre;
    const rondasPorCuadro = rondasDeLosCuadros(partidosDeCuadro.filter((p) => p.torneoId === torneo.id));
    const suyos = partidos.filter((p) => p.torneoId === torneo.id);

    historial.torneos.push({
      torneoId: torneo.id,
      nombre,
      categoria: torneo.categoria.nombre,
      instancia: instanciaEnElTorneo(jugadorId, suyos, rondasPorCuadro, torneo.gruposCerrados),
      puntos: puntosPorTorneo.get(torneo.id) ?? null,
    });

    for (const p of suyos.filter(tieneResultado).sort(ordenEnElTorneo)) {
      const esA = p.jugadorAId === jugadorId;
      const rival = esA ? p.jugadorB : p.jugadorA;
      if (!rival) continue;
      historial.partidos.push({
        id: p.id,
        torneoId: torneo.id,
        torneo: nombre,
        grupo: p.cuadro ? null : p.grupo,
        cuadro: (p.cuadro?.toLowerCase() ?? null) as ClaveCuadro | null,
        ronda: p.cuadro ? p.ronda : null,
        rondas: p.cuadro ? (rondasPorCuadro.get(p.cuadro) ?? null) : null,
        // Sin teléfono ni email: es una pantalla pública.
        rival: { jugadorId: rival.id, nombre: rival.nombre, apellido: rival.apellido },
        gano: p.ganadorId === jugadorId,
        estado: p.estado.toLowerCase() as PartidoDeLaFicha['estado'],
        marcador: marcador(p, esA),
      });
    }
  }

  return { ...historial, record: recordDelJugador(jugadorId, partidos) };
}

// La instancia de un movimiento, como la nombra la interfaz. Dieciseisavos no está en la tabla de
// puntos (decisión 056): un movimiento así no dice nada que la ficha pueda explicar.
function instanciaDelMovimiento(instancia: string | null): Instancia | null {
  const clave = instancia?.toLowerCase();
  return instancias.find((i) => i.clave === clave)?.clave ?? null;
}

export type MovimientoConInstancia = MovimientoDeRanking & { instancia: string | null };

// Los casilleros de su fila del ranking, con la instancia del movimiento que dio cada uno. Los
// importados de la planilla no tienen instancia. Los movimientos tienen que ser todos del jugador
// y de la categoría de la fila.
export function casillerosConInstancia(casilleros: Casillero[], movimientos: MovimientoConInstancia[]): CasilleroDeLaFicha[] {
  const vigentes = casillerosVigentes(movimientos);
  return casilleros.map((casillero) => ({
    ...casillero,
    instancia: instanciaDelMovimiento(vigentes.find((m) => m.etapaId === casillero.etapaId)?.instancia ?? null),
  }));
}
