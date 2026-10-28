// Cierre del torneo (F16): hasta dónde llegó cada jugador y cómo queda el ranking con sus puntos.
// Lógica pura: recibe los cuadros terminados y los movimientos ya leídos. No toca la base.
import { instancias, type Instancia } from '@setpoint/shared';
import { asignarPuestos, casillerosVigentes, puntosVigentes, type MovimientoDeRanking } from '../ranking/ranking';
import type { EstadoPartido } from './clasificacion';

export type PartidoDelCierre = {
  cuadro: 'CAMPEONATO' | 'COMPLEMENTARIA';
  ronda: number;
  jugadorAId: number | null;
  jugadorBId: number | null;
  ganadorId: number | null;
  estado: EstadoPartido;
};

const CON_RESULTADO: EstadoPartido[] = ['JUGADA', 'WALKOVER', 'ABANDONO'];

// Se cierra con todos los partidos de los cuadros resueltos: con las finales jugadas, los demás
// ya lo están, porque un partido de cuadro no se juega sin el ganador del anterior. Un cancelado
// no frena, como en el cierre de las zonas.
export function cuadrosTerminados(partidos: PartidoDelCierre[]) {
  return (
    partidos.length > 0 &&
    partidos.every((p) => p.estado === 'CANCELADA' || (CON_RESULTADO.includes(p.estado) && p.ganadorId !== null))
  );
}

// La instancia de quien pierde, según cuántas rondas le faltaban para la final.
const POR_RONDAS_A_LA_FINAL: Instancia[] = ['finalista', 'semifinalista', 'cuartos', 'octavos'];

// Hasta dónde llegó cada jugador de las zonas (02-dominio.md §7.4). Solo cuenta el cuadro
// principal: el resto, incluido el campeón del cuadro consuelo, es participación. También quien
// pierde antes de octavos, porque la tabla de puntos no tiene esa instancia (decisión 056).
// Con byes, quien entra en la segunda ronda y pierde ahí recibe la instancia de esa ronda.
export function instanciasDelTorneo(jugadores: number[], partidos: PartidoDelCierre[]): Map<number, Instancia> {
  const alcanzada = new Map<number, Instancia>(jugadores.map((id) => [id, 'participacion']));
  const delPrincipal = partidos.filter((p) => p.cuadro === 'CAMPEONATO');
  if (delPrincipal.length === 0) return alcanzada;

  const rondas = Math.max(...delPrincipal.map((p) => p.ronda));
  for (const partido of delPrincipal) {
    if (partido.ganadorId === null) continue;
    const perdedor = partido.ganadorId === partido.jugadorAId ? partido.jugadorBId : partido.jugadorAId;
    const instancia = POR_RONDAS_A_LA_FINAL[rondas - partido.ronda];
    if (perdedor !== null && instancia) alcanzada.set(perdedor, instancia);
    if (partido.ronda === rondas) alcanzada.set(partido.ganadorId, 'campeon');
  }
  return alcanzada;
}

// Una instancia sin fila en la tabla de puntos vale 0, como en la pantalla Tu circuito.
export type TablaDePuntos = Partial<Record<Instancia, number>>;

export function puntosDeLaInstancia(tabla: TablaDePuntos, instancia: Instancia) {
  return tabla[instancia] ?? 0;
}

export type JugadorDeLaCategoria = { id: number; apellido: string };

// Cómo queda el ranking de la categoría con los puntos del torneo. `antes` son los movimientos de
// la categoría sin los del torneo, y `delTorneo`, los que agrega el cierre: como son los más
// recientes de su casillero, reemplazan a los anteriores (02-dominio.md §7.2).
export function rankingConElCierre(
  jugadores: JugadorDeLaCategoria[],
  antes: MovimientoDeRanking[],
  delTorneo: MovimientoDeRanking[],
  etapaId: number,
) {
  const conTodos = (puntos: Map<number, number>) => new Map(jugadores.map((j) => [j.id, puntos.get(j.id) ?? 0]));
  const puestosAntes = asignarPuestos(conTodos(puntosVigentes(antes)));
  const acumulados = puntosVigentes([...antes, ...delTorneo]);
  const puestosDespues = asignarPuestos(conTodos(acumulados));
  const reemplazados = new Map(
    casillerosVigentes(antes)
      .filter((m) => m.etapaId === etapaId)
      .map((m) => [m.jugadorId, m.puntos]),
  );

  // Con empate en el primer puesto, se muestra el primero por apellido, como en la tabla pública.
  const porApellido = [...jugadores].sort((a, b) => a.apellido.localeCompare(b.apellido, 'es'));
  const primero = porApellido.find((j) => puestosDespues.get(j.id) === 1) ?? null;

  return {
    delJugador: (jugadorId: number) => ({
      reemplaza: reemplazados.get(jugadorId) ?? 0,
      acumulado: acumulados.get(jugadorId) ?? 0,
      puestoAntes: puestosAntes.get(jugadorId) ?? null,
      puestoDespues: puestosDespues.get(jugadorId) ?? null,
    }),
    cambianDePuesto: jugadores.filter((j) => puestosAntes.get(j.id) !== puestosDespues.get(j.id)).length,
    numeroUno: primero && { jugadorId: primero.id, esNuevo: puestosAntes.get(primero.id) !== 1 },
  };
}

const ordenDeInstancia = (instancia: Instancia) => instancias.findIndex((i) => i.clave === instancia);

// De la instancia más alta a la más baja; dentro de cada una, por puesto en el ranking (los que no
// están en él, al final) y por apellido.
export function ordenarFilas<F extends { instancia: Instancia; apellido: string; ranking: { puestoDespues: number | null } | null }>(
  filas: F[],
): F[] {
  const puesto = (f: F) => f.ranking?.puestoDespues ?? Infinity;
  return [...filas].sort(
    (a, b) =>
      ordenDeInstancia(a.instancia) - ordenDeInstancia(b.instancia) ||
      puesto(a) - puesto(b) ||
      a.apellido.localeCompare(b.apellido, 'es'),
  );
}
