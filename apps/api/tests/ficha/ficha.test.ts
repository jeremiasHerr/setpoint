import { describe, expect, it } from 'vitest';
import {
  casillerosConInstancia,
  historialDelJugador,
  instanciaEnElTorneo,
  recordDelJugador,
  type MovimientoConInstancia,
  type PartidoDeCuadroLeido,
  type PartidoDeLaFichaLeido,
  type TorneoDeLaFichaLeido,
} from '../../src/modules/ficha/ficha';

const YO = 1;
const sanhueza = { id: YO, nombre: 'Martín', apellido: 'Sanhueza' };
const roa = { id: 2, nombre: 'Javier', apellido: 'Roa' };

let proximoId = 1;
function partido(datos: Partial<PartidoDeLaFichaLeido>): PartidoDeLaFichaLeido {
  return {
    id: proximoId++,
    torneoId: 10,
    grupo: 'C',
    cuadro: null,
    ronda: null,
    jugadorAId: YO,
    jugadorBId: roa.id,
    ganadorId: null,
    estado: 'PENDIENTE_COORDINACION',
    fechaAcordada: null,
    jugadorA: sanhueza,
    jugadorB: roa,
    sets: [],
    ...datos,
  };
}

// Un partido de cuadro: la zona no se guarda en los de cuadro.
const deCuadro = (datos: Partial<PartidoDeLaFichaLeido>) => partido({ grupo: null, cuadro: 'CAMPEONATO', ...datos });

function torneo(datos: Partial<TorneoDeLaFichaLeido>): TorneoDeLaFichaLeido {
  return {
    id: 10,
    nombre: 'Primavera 26',
    edicion: 'Primavera 26',
    categoria: { nombre: 'Tercera' },
    fechaInicio: new Date('2026-09-01'),
    creadoEn: new Date('2026-08-01'),
    gruposCerrados: true,
    ...datos,
  };
}

const sets = [
  { gamesA: 6, gamesB: 3 },
  { gamesA: 6, gamesB: 4 },
];

describe('recordDelJugador', () => {
  it('cuenta los jugados con resultado, ganados y perdidos', () => {
    const record = recordDelJugador(YO, [
      partido({ estado: 'JUGADA', ganadorId: YO }),
      partido({ estado: 'JUGADA', ganadorId: roa.id }),
      partido({ estado: 'CONFIRMADA' }),
    ]);

    expect(record).toEqual({ jugados: 2, ganados: 1, perdidos: 1, walkovers: 0 });
  });

  it('el W.O. no cuenta, gane o pierda, y se cuenta aparte (decisión 073)', () => {
    const record = recordDelJugador(YO, [
      partido({ estado: 'WALKOVER', ganadorId: YO }),
      partido({ estado: 'WALKOVER', ganadorId: roa.id }),
      partido({ estado: 'JUGADA', ganadorId: YO }),
    ]);

    expect(record).toEqual({ jugados: 1, ganados: 1, perdidos: 0, walkovers: 2 });
  });

  it('el abandono sí cuenta, para quien siguió y para quien abandonó', () => {
    const abandono = partido({ estado: 'ABANDONO', ganadorId: roa.id });

    expect(recordDelJugador(YO, [abandono])).toEqual({ jugados: 1, ganados: 0, perdidos: 1, walkovers: 0 });
    expect(recordDelJugador(roa.id, [abandono])).toEqual({ jugados: 1, ganados: 1, perdidos: 0, walkovers: 0 });
  });
});

describe('instanciaEnElTorneo', () => {
  // Un cuadro de 8: cuartos, semis y final.
  const rondas = new Map([['CAMPEONATO', 3], ['COMPLEMENTARIA', 2]]);

  it('sin partidos de cuadro, está en la zona mientras se juega', () => {
    expect(instanciaEnElTorneo(YO, [partido({})], new Map(), false)).toEqual({ tipo: 'zona', enJuego: true });
  });

  it('sin partidos de cuadro y con las zonas cerradas, quedó en la zona', () => {
    expect(instanciaEnElTorneo(YO, [partido({ estado: 'JUGADA', ganadorId: roa.id })], new Map(), true)).toEqual({
      tipo: 'zona',
      enJuego: false,
    });
  });

  it('quien ganó la final es campeón', () => {
    const partidos = [
      deCuadro({ ronda: 1, estado: 'JUGADA', ganadorId: YO }),
      deCuadro({ ronda: 2, estado: 'JUGADA', ganadorId: YO }),
      deCuadro({ ronda: 3, estado: 'JUGADA', ganadorId: YO }),
    ];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toEqual({
      tipo: 'cuadro',
      cuadro: 'campeonato',
      ronda: 3,
      rondas: 3,
      campeon: true,
      enJuego: false,
    });
  });

  it('quien perdió queda en la ronda de su último partido, también en el cuadro consuelo', () => {
    const partidos = [
      partido({ estado: 'JUGADA', ganadorId: roa.id }),
      deCuadro({ cuadro: 'COMPLEMENTARIA', ronda: 1, estado: 'JUGADA', ganadorId: YO }),
      deCuadro({ cuadro: 'COMPLEMENTARIA', ronda: 2, estado: 'WALKOVER', ganadorId: roa.id }),
    ];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toMatchObject({
      cuadro: 'complementaria',
      ronda: 2,
      rondas: 2,
      campeon: false,
      enJuego: false,
    });
  });

  it('con su último partido sin resultado, lo está jugando', () => {
    const partidos = [deCuadro({ ronda: 1, estado: 'JUGADA', ganadorId: YO }), deCuadro({ ronda: 2, estado: 'CONFIRMADA' })];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toMatchObject({ ronda: 2, enJuego: true, campeon: false });
  });

  it('las rondas son las del cuadro, aunque entre con bye en la segunda', () => {
    const partidos = [deCuadro({ ronda: 2, estado: 'JUGADA', ganadorId: roa.id })];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toMatchObject({ ronda: 2, rondas: 3, enJuego: false });
  });

  it('si ganó y no hay partido siguiente todavía, espera en la ronda siguiente', () => {
    const partidos = [deCuadro({ ronda: 1, estado: 'JUGADA', ganadorId: YO })];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toMatchObject({ ronda: 2, enJuego: true });
  });

  it('un partido de cuadro cancelado no cuenta', () => {
    const partidos = [deCuadro({ ronda: 1, estado: 'JUGADA', ganadorId: roa.id }), deCuadro({ ronda: 2, estado: 'CANCELADA' })];

    expect(instanciaEnElTorneo(YO, partidos, rondas, true)).toMatchObject({ ronda: 1, enJuego: false });
  });
});

describe('historialDelJugador', () => {
  const cuadros: PartidoDeCuadroLeido[] = [
    { torneoId: 10, cuadro: 'CAMPEONATO', ronda: 1 },
    { torneoId: 10, cuadro: 'CAMPEONATO', ronda: 2 },
  ];

  it('ordena los torneos del más reciente al más viejo, con sus puntos o null', () => {
    const torneos = [
      torneo({ id: 10, edicion: 'Primavera 26', fechaInicio: new Date('2026-09-01') }),
      torneo({ id: 20, edicion: null, nombre: 'Copa del Limay', fechaInicio: null, creadoEn: new Date('2026-10-15') }),
    ];
    const partidos = [partido({ torneoId: 10 }), partido({ torneoId: 20 })];

    const historial = historialDelJugador(YO, torneos, partidos, [], new Map([[10, 15]]));

    expect(historial.torneos.map((t) => [t.nombre, t.puntos])).toEqual([
      ['Copa del Limay', null],
      ['Primavera 26', 15],
    ]);
  });

  it('solo lista los partidos con resultado: los cuadros primero, de la última ronda a la primera', () => {
    const partidos = [
      partido({ estado: 'JUGADA', ganadorId: YO, sets }),
      partido({ estado: 'CONFIRMADA' }),
      deCuadro({ ronda: 1, estado: 'JUGADA', ganadorId: YO, sets }),
      deCuadro({ ronda: 2, estado: 'JUGADA', ganadorId: roa.id, sets }),
    ];

    const historial = historialDelJugador(YO, [torneo({})], partidos, cuadros, new Map());

    expect(historial.partidos.map((p) => [p.grupo, p.ronda, p.rondas])).toEqual([
      [null, 2, 2],
      [null, 1, 2],
      ['C', null, null],
    ]);
  });

  it('en la zona, del partido con la fecha más reciente al más viejo, y los sin fecha al final', () => {
    const sinFecha = partido({ estado: 'WALKOVER', ganadorId: YO });
    const viejo = partido({ estado: 'JUGADA', ganadorId: YO, sets, fechaAcordada: new Date('2026-09-05') });
    const nuevo = partido({ estado: 'JUGADA', ganadorId: YO, sets, fechaAcordada: new Date('2026-09-12') });

    const historial = historialDelJugador(YO, [torneo({})], [sinFecha, viejo, nuevo], [], new Map());

    expect(historial.partidos.map((p) => p.id)).toEqual([nuevo.id, viejo.id, sinFecha.id]);
  });

  it('cada partido va desde su lado: el rival, si ganó y el marcador', () => {
    const comoB = partido({
      jugadorAId: roa.id,
      jugadorBId: YO,
      jugadorA: roa,
      jugadorB: sanhueza,
      estado: 'JUGADA',
      ganadorId: roa.id,
      sets: [{ gamesA: 6, gamesB: 4 }, { gamesA: 3, gamesB: 6 }, { gamesA: 10, gamesB: 8 }],
    });

    const [visto] = historialDelJugador(YO, [torneo({})], [comoB], [], new Map()).partidos;

    expect(visto).toMatchObject({
      torneo: 'Primavera 26',
      rival: { jugadorId: roa.id, nombre: 'Javier', apellido: 'Roa' },
      gano: false,
      estado: 'jugada',
      marcador: '4-6 6-3 8-10',
    });
  });

  it('el W.O. figura en la lista, aunque no cuente en el récord', () => {
    const historial = historialDelJugador(YO, [torneo({})], [partido({ estado: 'WALKOVER', ganadorId: YO })], [], new Map());

    expect(historial.partidos[0]).toMatchObject({ estado: 'walkover', marcador: 'W.O.', gano: true });
    expect(historial.record).toEqual({ jugados: 0, ganados: 0, perdidos: 0, walkovers: 1 });
  });
});

describe('casillerosConInstancia', () => {
  const movimiento = (datos: Partial<MovimientoConInstancia>): MovimientoConInstancia => ({
    id: proximoId++,
    jugadorId: YO,
    etapaId: 5,
    puntos: 10,
    fecha: new Date('2025-10-01'),
    instancia: null,
    ...datos,
  });

  it('cada casillero lleva la instancia del movimiento vigente, el que reemplazó al anterior', () => {
    const movimientos = [
      movimiento({ puntos: 10, instancia: 'PARTICIPACION', fecha: new Date('2025-10-01') }),
      movimiento({ puntos: 75, instancia: 'FINALISTA', fecha: new Date('2026-10-01') }),
    ];

    expect(casillerosConInstancia([{ etapaId: 5, puntos: 75, anio: 2026 }], movimientos)).toEqual([
      { etapaId: 5, puntos: 75, anio: 2026, instancia: 'finalista' },
    ]);
  });

  it('los importados de la planilla no tienen instancia', () => {
    expect(casillerosConInstancia([{ etapaId: 5, puntos: 10, anio: 2025 }], [movimiento({})])).toEqual([
      { etapaId: 5, puntos: 10, anio: 2025, instancia: null },
    ]);
  });

  it('una instancia que no está en la tabla de puntos no se explica', () => {
    const movimientos = [movimiento({ instancia: 'DIECISEISAVOS' })];

    expect(casillerosConInstancia([{ etapaId: 5, puntos: 10, anio: 2025 }], movimientos)[0].instancia).toBeNull();
  });
});
