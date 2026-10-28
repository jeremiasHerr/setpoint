import { describe, expect, it } from 'vitest';
import {
  cuadrosTerminados,
  instanciasDelTorneo,
  ordenarFilas,
  puntosDeLaInstancia,
  rankingConElCierre,
  type PartidoDelCierre,
} from '../../src/modules/competencia/cierre';
import type { MovimientoDeRanking } from '../../src/modules/ranking/ranking';

// Un cuadro jugado en el que siempre gana el jugador A: partidos de la primera ronda con los
// jugadores dados de a pares, y en las rondas siguientes el ganador de cada par anterior.
function cuadroJugado(cuadro: PartidoDelCierre['cuadro'], jugadores: number[]): PartidoDelCierre[] {
  const partidos: PartidoDelCierre[] = [];
  let enJuego = jugadores;
  for (let ronda = 1; enJuego.length > 1; ronda++) {
    const ganadores: number[] = [];
    for (let i = 0; i < enJuego.length; i += 2) {
      partidos.push({
        cuadro,
        ronda,
        jugadorAId: enJuego[i],
        jugadorBId: enJuego[i + 1],
        ganadorId: enJuego[i],
        estado: 'JUGADA',
      });
      ganadores.push(enJuego[i]);
    }
    enJuego = ganadores;
  }
  return partidos;
}

const desde = (inicio: number, cantidad: number) => Array.from({ length: cantidad }, (_, i) => inicio + i);

describe('cuadrosTerminados', () => {
  it('con todos los partidos resueltos, sí', () => {
    expect(cuadrosTerminados(cuadroJugado('CAMPEONATO', desde(1, 4)))).toBe(true);
  });

  it('con la final sin jugar, no', () => {
    const partidos = cuadroJugado('CAMPEONATO', desde(1, 4));
    partidos[2] = { ...partidos[2], ganadorId: null, estado: 'PENDIENTE_COORDINACION' };
    expect(cuadrosTerminados(partidos)).toBe(false);
  });

  it('un W.O. o un abandono cuentan como resueltos, y un cancelado no frena', () => {
    const partidos = cuadroJugado('CAMPEONATO', desde(1, 4));
    partidos[0] = { ...partidos[0], estado: 'WALKOVER' };
    partidos[1] = { ...partidos[1], estado: 'ABANDONO' };
    const cancelado: PartidoDelCierre = { ...partidos[2], cuadro: 'COMPLEMENTARIA', ganadorId: null, estado: 'CANCELADA' };
    expect(cuadrosTerminados([...partidos, cancelado])).toBe(true);
  });

  it('sin cuadros, no: las zonas todavía no se cerraron', () => {
    expect(cuadrosTerminados([])).toBe(false);
  });
});

describe('instanciasDelTorneo', () => {
  // 32 jugadores en 8 zonas: 16 al principal y 16 al consuelo (02-dominio.md §3.3).
  const principal = desde(1, 16);
  const consuelo = desde(17, 16);
  const instancias = instanciasDelTorneo(
    [...principal, ...consuelo],
    [...cuadroJugado('CAMPEONATO', principal), ...cuadroJugado('COMPLEMENTARIA', consuelo)],
  );

  it('da la instancia del cuadro principal según la ronda en que perdió cada uno', () => {
    expect(instancias.get(1)).toBe('campeon');
    expect(instancias.get(9)).toBe('finalista');
    expect([5, 13].map((id) => instancias.get(id))).toEqual(['semifinalista', 'semifinalista']);
    expect([3, 7, 11, 15].every((id) => instancias.get(id) === 'cuartos')).toBe(true);
    expect([2, 4, 6, 8, 10, 12, 14, 16].every((id) => instancias.get(id) === 'octavos')).toBe(true);
  });

  it('todo el cuadro consuelo, con su campeón, es participación', () => {
    expect(consuelo.every((id) => instancias.get(id) === 'participacion')).toBe(true);
  });

  it('sin cuadro consuelo, quien no pasó al principal también es participación', () => {
    const conAfuera = instanciasDelTorneo(desde(1, 6), cuadroJugado('CAMPEONATO', desde(1, 4)));
    expect([5, 6].map((id) => conAfuera.get(id))).toEqual(['participacion', 'participacion']);
  });

  it('con 32 en el principal, quien pierde en dieciseisavos es participación (decisión 056)', () => {
    const grande = instanciasDelTorneo(desde(1, 32), cuadroJugado('CAMPEONATO', desde(1, 32)));
    expect(grande.get(2)).toBe('participacion');
    expect(grande.get(3)).toBe('octavos');
  });

  it('con bye, quien entra en la segunda ronda recibe la instancia de la ronda en que perdió', () => {
    // 3 jugadores: el 1 tiene bye y espera en la final al ganador de 2 contra 3.
    const partidos: PartidoDelCierre[] = [
      { cuadro: 'CAMPEONATO', ronda: 1, jugadorAId: 2, jugadorBId: 3, ganadorId: 3, estado: 'JUGADA' },
      { cuadro: 'CAMPEONATO', ronda: 2, jugadorAId: 1, jugadorBId: 3, ganadorId: 3, estado: 'JUGADA' },
    ];
    const conBye = instanciasDelTorneo([1, 2, 3], partidos);
    expect([conBye.get(3), conBye.get(1), conBye.get(2)]).toEqual(['campeon', 'finalista', 'semifinalista']);
  });

  it('cuando gana el jugador B, el perdedor es el A', () => {
    const final: PartidoDelCierre = { cuadro: 'CAMPEONATO', ronda: 1, jugadorAId: 1, jugadorBId: 2, ganadorId: 2, estado: 'WALKOVER' };
    const resultado = instanciasDelTorneo([1, 2], [final]);
    expect([resultado.get(2), resultado.get(1)]).toEqual(['campeon', 'finalista']);
  });
});

describe('puntosDeLaInstancia', () => {
  it('una instancia sin fila en la tabla vale 0', () => {
    expect(puntosDeLaInstancia({ campeon: 100 }, 'campeon')).toBe(100);
    expect(puntosDeLaInstancia({ campeon: 100 }, 'octavos')).toBe(0);
  });
});

describe('rankingConElCierre', () => {
  const OTONO = 3;
  const PRIMAVERA = 1;
  let id = 0;
  const movimiento = (jugadorId: number, etapaId: number, puntos: number, fecha: string): MovimientoDeRanking => ({
    id: ++id,
    jugadorId,
    etapaId,
    puntos,
    fecha: new Date(fecha),
  });

  const jugadores = [
    { id: 1, apellido: 'Sanhueza' },
    { id: 2, apellido: 'Quiroga' },
    { id: 3, apellido: 'Roa' },
  ];
  const antes = [
    movimiento(1, OTONO, 10, '2025-05-01'),
    movimiento(1, PRIMAVERA, 65, '2025-10-01'),
    movimiento(2, OTONO, 50, '2025-05-01'),
    movimiento(2, PRIMAVERA, 100, '2025-10-01'),
    movimiento(3, PRIMAVERA, 70, '2025-10-01'),
  ];
  const delTorneo = [movimiento(1, OTONO, 100, '2026-05-20'), movimiento(2, OTONO, 15, '2026-05-20')];
  const ranking = rankingConElCierre(jugadores, antes, delTorneo, OTONO);

  it('los puntos del torneo reemplazan a los del mismo casillero, no se suman encima', () => {
    expect(ranking.delJugador(1)).toEqual({ reemplaza: 10, acumulado: 165, puestoAntes: 2, puestoDespues: 1 });
    expect(ranking.delJugador(2)).toEqual({ reemplaza: 50, acumulado: 115, puestoAntes: 1, puestoDespues: 2 });
  });

  it('cuenta a los que cambian de puesto aunque no hayan jugado', () => {
    // Roa no jugó y sigue 3º: cambian Sanhueza y Quiroga.
    expect(ranking.delJugador(3)).toMatchObject({ reemplaza: 0, puestoAntes: 3, puestoDespues: 3 });
    expect(ranking.cambianDePuesto).toBe(2);
  });

  it('dice quién queda número uno y si es nuevo', () => {
    expect(ranking.numeroUno).toEqual({ jugadorId: 1, esNuevo: true });
  });

  it('quien no está en la categoría no tiene puesto', () => {
    expect(ranking.delJugador(99)).toMatchObject({ puestoAntes: null, puestoDespues: null });
  });
});

describe('ordenarFilas', () => {
  it('de la instancia más alta a la más baja, y dentro de cada una por puesto y apellido', () => {
    const fila = (apellido: string, instancia: 'campeon' | 'cuartos' | 'participacion', puesto: number | null) => ({
      apellido,
      instancia,
      ranking: { puestoDespues: puesto },
    });
    const ordenadas = ordenarFilas([
      fila('Zárate', 'participacion', 4),
      fila('Bustos', 'participacion', null),
      fila('Ledesma', 'participacion', 4),
      fila('Mansilla', 'cuartos', 6),
      fila('Sanhueza', 'campeon', 1),
    ]);
    expect(ordenadas.map((f) => f.apellido)).toEqual(['Sanhueza', 'Mansilla', 'Ledesma', 'Zárate', 'Bustos']);
  });
});
