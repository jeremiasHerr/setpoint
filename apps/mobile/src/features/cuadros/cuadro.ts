import { lugarSiguiente, type CuadroEliminatorio, type EstadoPartido, type JugadorDelCuadro, type PartidoDelCuadro } from '@setpoint/shared';

// Los cuadros en la app (F11, decisión 136): una ronda a la vez, como el celular en la web
// (decisión 038). Es la misma lógica que apps/web/src/features/cuadros/cuadro.ts: dónde va cada
// partido, quién pasa directo por un bye (decisión 083) y en qué ronda abre.

const RONDAS_DESDE_LA_FINAL = ['final', 'semis', 'cuartos', 'octavos'];

// "octavos", "cuartos"... contando desde la final. Más atrás de octavos, el número de ronda.
export function rotuloDeRonda(ronda: number, rondas: number) {
  return RONDAS_DESDE_LA_FINAL[rondas - ronda] ?? `ronda ${ronda}`;
}

const CON_RESULTADO: EstadoPartido[] = ['jugada', 'walkover', 'abandono'];

export const tieneResultado = (partido: PartidoDelCuadro) => CON_RESULTADO.includes(partido.estado);

export type LugarDelCuadro = { tipo: 'partido'; partido: PartidoDelCuadro } | { tipo: 'pase'; jugador: JugadorDelCuadro } | null;

// Quien tuvo bye en el lugar `orden` de la primera ronda: ya está en el partido de la segunda.
function quienPasaDirecto(cuadro: CuadroEliminatorio, orden: number): JugadorDelCuadro | null {
  const { ordenEnRonda, lado } = lugarSiguiente(orden);
  const siguiente = cuadro.partidos.find((p) => p.ronda === 2 && p.ordenEnRonda === ordenEnRonda);
  return (lado === 'A' ? siguiente?.jugadorA : siguiente?.jugadorB) ?? null;
}

// Los lugares de una ronda, de arriba hacia abajo. Donde hubo un bye no hay partido (decisión 023)
// y el lugar lleva a quien pasa directo (decisión 083).
export function lugaresDeLaRonda(cuadro: CuadroEliminatorio, ronda: number): LugarDelCuadro[] {
  const lugares = 2 ** (cuadro.rondas - ronda);
  return Array.from({ length: lugares }, (_, i) => {
    const partido = cuadro.partidos.find((p) => p.ronda === ronda && p.ordenEnRonda === i + 1);
    if (partido) return { tipo: 'partido', partido };
    const jugador = ronda === 1 ? quienPasaDirecto(cuadro, i + 1) : null;
    return jugador ? { tipo: 'pase', jugador } : null;
  });
}

// "pasa directo a semis", "pasa directo a la final".
export function rotuloDelPaseDirecto(rondas: number) {
  const destino = rotuloDeRonda(2, rondas);
  return `pasa directo a ${destino === 'final' || destino.startsWith('ronda') ? 'la ' : ''}${destino}`;
}

// La primera ronda con algo por jugar; si ya se jugó todo, la final. Es donde abre.
export function rondaEnCurso(cuadro: CuadroEliminatorio) {
  return cuadro.partidos.find((p) => !tieneResultado(p))?.ronda ?? cuadro.rondas;
}

// La ronda en la que juega o jugó por última vez el jugador, si está en el cuadro: abre ahí, que es
// lo que busca quien entra desde Mi zona. Si no está, la ronda en curso.
export function rondaParaAbrir(cuadro: CuadroEliminatorio, jugadorId: number | undefined) {
  const suyos = cuadro.partidos.filter((p) => p.jugadorA?.jugadorId === jugadorId || p.jugadorB?.jugadorId === jugadorId);
  return suyos.length > 0 ? Math.max(...suyos.map((p) => p.ronda)) : rondaEnCurso(cuadro);
}

// Lo que va a la derecha de cada jugador: los games de cada set. Un W.O. y un abandono lo dicen
// del lado del ganador, sin sets (decisiones 016 y 059).
export function marcadorDelLado(partido: PartidoDelCuadro, lado: 'A' | 'B'): string {
  if (!tieneResultado(partido)) return '';
  const esGanador = partido.ganadorId === (lado === 'A' ? partido.jugadorA : partido.jugadorB)?.jugadorId;
  if (partido.estado === 'walkover') return esGanador ? 'W.O.' : '';
  if (partido.estado === 'abandono' && partido.sets.length === 0) return esGanador ? 'ab.' : '';
  return partido.sets.map((s) => (lado === 'A' ? s.gamesA : s.gamesB)).join(' ');
}
