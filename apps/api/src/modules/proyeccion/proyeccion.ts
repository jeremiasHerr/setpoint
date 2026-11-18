// Proyecciones de ranking (F20): cómo queda un jugador según hasta dónde llegue en un torneo que
// todavía no cerró. Lógica pura: recibe todo ya leído. No toca la base.
import {
  instancias,
  type EscenarioDeProyeccion,
  type Instancia,
  type InstanciaDeLaFicha,
  type ProyeccionDelJugador,
} from '@setpoint/shared';
import { instanciaDelPerdedor, puntosDeLaInstancia, rankingConElCierre, type TablaDePuntos } from '../competencia/cierre';
import { casillerosVigentes, puntosVigentes, type MovimientoDeRanking } from '../ranking/ranking';

// Cuántas rondas va a tener el cuadro principal, antes de que se arme: clasifican los primeros de
// cada zona, y los lugares que sobran hasta la potencia de 2 son byes (02-dominio.md §3.2).
// `zonas` es el tamaño de cada una. Con menos de dos clasificados no hay cuadro.
export function rondasPorElFormato(zonas: number[], clasificanPorGrupo: number) {
  const clasificados = zonas.reduce((suma, tamano) => suma + Math.min(clasificanPorGrupo, tamano), 0);
  return clasificados < 2 ? 0 : Math.ceil(Math.log2(clasificados));
}

// La tabla de puntos va de campeón a participación: acá, al revés y sin repetidos.
const dePeorAMejor = (lista: Instancia[]) =>
  instancias
    .map((i) => i.clave)
    .reverse()
    .filter((clave) => lista.includes(clave));

// Todo lo que puede pasar desde una ronda del cuadro principal: perder en esa, en cualquiera de las
// que siguen, o ganar el torneo.
function desdeLaRonda(ronda: number, rondas: number): Instancia[] {
  const perdiendo = Array.from({ length: rondas - ronda + 1 }, (_, i) => instanciaDelPerdedor(rondas, ronda + i));
  return dePeorAMejor([...perdiendo, 'campeon']);
}

// Las instancias en las que todavía puede terminar un jugador, de la peor a la mejor. La primera es
// la que ya tiene asegurada: la que recibe si pierde su próximo partido. Con una sola, su torneo
// ya está definido. `situacion` es null antes del sorteo, y `rondas`, las del cuadro principal.
export function instanciasAlcanzables(situacion: InstanciaDeLaFicha | null, rondas: number): Instancia[] {
  // Antes de los cuadros todo está abierto: desde no pasar al principal hasta ganarlo.
  if (situacion === null || (situacion.tipo === 'zona' && situacion.enJuego)) {
    return rondas === 0 ? ['participacion'] : dePeorAMejor(['participacion', ...desdeLaRonda(1, rondas)]);
  }
  // No pasó al cuadro principal: el cuadro consuelo no da más que participación (02-dominio.md §7.4).
  if (situacion.tipo === 'zona' || situacion.cuadro !== 'campeonato') return ['participacion'];
  if (situacion.enJuego) return desdeLaRonda(situacion.ronda, situacion.rondas);
  return [situacion.campeon ? 'campeon' : instanciaDelPerdedor(situacion.rondas, situacion.ronda)];
}

export type JugadorDeLaProyeccion = { id: number; nombre: string; apellido: string };

type Datos = {
  jugadorId: number;
  // Las instancias alcanzables de cada jugador del torneo, él incluido.
  alcanzables: Map<number, Instancia[]>;
  tabla: TablaDePuntos;
  // Como en el cierre: los jugadores que hoy están en la categoría, y los movimientos de la
  // categoría sin los de este torneo.
  deLaCategoria: JugadorDeLaProyeccion[];
  movimientos: MovimientoDeRanking[];
  etapaId: number;
  ahora: Date;
};

type Proyeccion = Pick<ProyeccionDelJugador, 'hoy' | 'defiende' | 'definido' | 'escenarios' | 'numeroUno'>;

// Un escenario es un cierre hipotético: el jugador con la instancia de ese escenario y los demás
// del torneo con la que ya tienen asegurada (decisión 104). Sale de la misma cuenta que la vista
// previa del cierre, así que lo que proyecta es lo que después pasa.
export function proyectar({ jugadorId, alcanzables, tabla, deLaCategoria, movimientos, etapaId, ahora }: Datos): Proyeccion {
  // Con el id más alto posible, para que sea el más reciente de su casillero y lo reemplace.
  const movimiento = (id: number, instancia: Instancia): MovimientoDeRanking => ({
    id: Number.MAX_SAFE_INTEGER,
    jugadorId: id,
    etapaId,
    puntos: puntosDeLaInstancia(tabla, instancia),
    fecha: ahora,
  });
  const asegurados = [...alcanzables]
    .filter(([id]) => id !== jugadorId)
    .map(([id, [asegurada]]) => movimiento(id, asegurada));

  const propias = alcanzables.get(jugadorId)!;
  const escenarios: EscenarioDeProyeccion[] = propias.map((instancia) => {
    const propio = movimiento(jugadorId, instancia);
    const ranking = rankingConElCierre(deLaCategoria, movimientos, [...asegurados, propio], etapaId).delJugador(jugadorId);
    return { instancia, puntos: propio.puntos, acumulado: ranking.acumulado, puesto: ranking.puestoDespues };
  });

  const hoy = rankingConElCierre(deLaCategoria, movimientos, [], etapaId).delJugador(jugadorId);
  const casillero = casillerosVigentes(movimientos).find((m) => m.jugadorId === jugadorId && m.etapaId === etapaId);

  // El mejor de los demás con lo asegurado; entre empatados, por apellido, como en la tabla pública.
  const conLoAsegurado = puntosVigentes([...movimientos, ...asegurados]);
  const [rival] = deLaCategoria
    .filter((j) => j.id !== jugadorId)
    .map((j) => ({ ...j, puntos: conLoAsegurado.get(j.id) ?? 0 }))
    .sort((a, b) => b.puntos - a.puntos || a.apellido.localeCompare(b.apellido, 'es'));
  const delRival = rival && alcanzables.get(rival.id);

  return {
    hoy: { puntos: hoy.acumulado, puesto: hoy.puestoAntes },
    defiende: casillero ? { puntos: casillero.puntos, anio: casillero.fecha.getUTCFullYear() } : null,
    definido: propias.length === 1,
    escenarios,
    numeroUno: {
      desde: escenarios.find((e) => e.puesto === 1)?.instancia ?? null,
      rival: rival
        ? {
            jugadorId: rival.id,
            nombre: rival.nombre,
            apellido: rival.apellido,
            puntos: rival.puntos,
            asegurada: delRival?.[0] ?? null,
            sigueEnJuego: (delRival?.length ?? 0) > 1,
          }
        : null,
    },
  };
}
