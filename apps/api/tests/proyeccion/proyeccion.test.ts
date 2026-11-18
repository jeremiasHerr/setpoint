import { describe, expect, it } from 'vitest';
import type { Instancia, InstanciaDeLaFicha } from '@setpoint/shared';
import { instanciasAlcanzables, proyectar, rondasPorElFormato } from '../../src/modules/proyeccion/proyeccion';
import type { MovimientoDeRanking } from '../../src/modules/ranking/ranking';

const enElPrincipal = (ronda: number, rondas: number, datos: { enJuego?: boolean; campeon?: boolean } = {}): InstanciaDeLaFicha => ({
  tipo: 'cuadro',
  cuadro: 'campeonato',
  ronda,
  rondas,
  enJuego: datos.enJuego ?? true,
  campeon: datos.campeon ?? false,
});

describe('rondasPorElFormato', () => {
  it('con 8 zonas y 2 clasificados por zona, el principal tiene 16 jugadores y 4 rondas', () => {
    expect(rondasPorElFormato(Array(8).fill(4), 2)).toBe(4);
  });

  it('si los clasificados no son potencia de 2, los byes completan la ronda', () => {
    // 6 zonas: 12 clasificados en un cuadro de 16.
    expect(rondasPorElFormato([4, 4, 4, 3, 3, 3], 2)).toBe(4);
  });

  it('una zona más chica que los que clasifican aporta los que tiene', () => {
    expect(rondasPorElFormato([1, 1], 2)).toBe(1);
  });

  it('con menos de dos clasificados no hay cuadro', () => {
    expect(rondasPorElFormato([1], 2)).toBe(0);
  });
});

describe('instanciasAlcanzables', () => {
  it('antes del sorteo y en las zonas todo está abierto, de participación a campeón', () => {
    const todas: Instancia[] = ['participacion', 'octavos', 'cuartos', 'semifinalista', 'finalista', 'campeon'];
    expect(instanciasAlcanzables(null, 4)).toEqual(todas);
    expect(instanciasAlcanzables({ tipo: 'zona', enJuego: true }, 4)).toEqual(todas);
  });

  it('con un principal de 8 no hay octavos', () => {
    expect(instanciasAlcanzables(null, 3)).toEqual(['participacion', 'cuartos', 'semifinalista', 'finalista', 'campeon']);
  });

  it('con un principal de 32, perder en dieciseisavos es participación y no se repite (decisión 056)', () => {
    expect(instanciasAlcanzables(null, 5)).toEqual(['participacion', 'octavos', 'cuartos', 'semifinalista', 'finalista', 'campeon']);
  });

  it('sin cuadro principal, solo participación', () => {
    expect(instanciasAlcanzables(null, 0)).toEqual(['participacion']);
  });

  it('en el principal, desde la ronda que le toca jugar: la primera es la que ya aseguró', () => {
    expect(instanciasAlcanzables(enElPrincipal(2, 4), 4)).toEqual(['cuartos', 'semifinalista', 'finalista', 'campeon']);
    expect(instanciasAlcanzables(enElPrincipal(4, 4), 4)).toEqual(['finalista', 'campeon']);
  });

  it('eliminado o campeón, queda una sola', () => {
    expect(instanciasAlcanzables(enElPrincipal(3, 4, { enJuego: false }), 4)).toEqual(['semifinalista']);
    expect(instanciasAlcanzables(enElPrincipal(4, 4, { enJuego: false, campeon: true }), 4)).toEqual(['campeon']);
  });

  it('quien no pasó al principal recibe participación, aunque siga en el cuadro consuelo', () => {
    expect(instanciasAlcanzables({ tipo: 'zona', enJuego: false }, 4)).toEqual(['participacion']);
    const enElConsuelo: InstanciaDeLaFicha = { tipo: 'cuadro', cuadro: 'complementaria', ronda: 3, rondas: 4, enJuego: true, campeon: false };
    expect(instanciasAlcanzables(enElConsuelo, 4)).toEqual(['participacion']);
  });
});

describe('proyectar', () => {
  const [PRIMAVERA, VERANO, OTONO] = [1, 2, 3];
  const tabla = { campeon: 100, finalista: 75, semifinalista: 50, cuartos: 25, octavos: 15, participacion: 10 };
  const [YO, QUIROGA, ROA, VERA, BRAVO] = [1, 2, 3, 4, 5];
  const deLaCategoria = [
    { id: YO, nombre: 'Martín', apellido: 'Sanhueza' },
    { id: QUIROGA, nombre: 'Tomás', apellido: 'Quiroga' },
    { id: ROA, nombre: 'Javier', apellido: 'Roa' },
    { id: VERA, nombre: 'Pablo', apellido: 'Vera' },
    { id: BRAVO, nombre: 'Lucas', apellido: 'Bravo' },
  ];

  let id = 0;
  const movimiento = (jugadorId: number, etapaId: number, puntos: number, fecha: string): MovimientoDeRanking => ({
    id: ++id,
    jugadorId,
    etapaId,
    puntos,
    fecha: new Date(fecha),
  });
  // El ranking antes de Otoño 26: Quiroga 165, Roa 120, Vera 110, Bravo 95 y yo 85, quinto.
  const movimientos = [
    movimiento(YO, PRIMAVERA, 75, '2025-10-01'),
    movimiento(YO, OTONO, 10, '2025-05-01'),
    movimiento(QUIROGA, PRIMAVERA, 100, '2025-10-01'),
    movimiento(QUIROGA, VERANO, 50, '2026-01-10'),
    movimiento(QUIROGA, OTONO, 15, '2025-05-01'),
    movimiento(ROA, VERANO, 100, '2026-01-10'),
    movimiento(ROA, PRIMAVERA, 20, '2025-10-01'),
    movimiento(VERA, PRIMAVERA, 110, '2025-10-01'),
    movimiento(BRAVO, VERANO, 45, '2026-01-10'),
    movimiento(BRAVO, OTONO, 50, '2025-05-01'),
  ];
  const cuartosEnAdelante: Instancia[] = ['cuartos', 'semifinalista', 'finalista', 'campeon'];

  // Estoy en cuartos. Quiroga ya está en semis, Roa perdió en octavos y Bravo no pasó la zona.
  // Vera no juega el torneo.
  const base = {
    jugadorId: YO,
    alcanzables: new Map<number, Instancia[]>([
      [YO, cuartosEnAdelante],
      [QUIROGA, ['semifinalista', 'finalista', 'campeon']],
      [ROA, ['octavos']],
      [BRAVO, ['participacion']],
    ]),
    tabla,
    deLaCategoria,
    movimientos,
    etapaId: OTONO,
    ahora: new Date('2026-05-20'),
  };

  it('hoy es el ranking sin este torneo, con lo que defiende en el casillero', () => {
    const proyeccion = proyectar(base);
    expect(proyeccion.hoy).toEqual({ puntos: 85, puesto: 5 });
    expect(proyeccion.defiende).toEqual({ puntos: 10, anio: 2025 });
    expect(proyeccion.definido).toBe(false);
  });

  it('en cada escenario los puntos reemplazan su casillero, no se suman encima', () => {
    const { escenarios } = proyectar(base);
    expect(escenarios.map((e) => [e.instancia, e.puntos, e.acumulado])).toEqual([
      ['cuartos', 25, 100],
      ['semifinalista', 50, 125],
      ['finalista', 75, 150],
      ['campeon', 100, 175],
    ]);
  });

  it('el puesto cuenta a los demás con lo que ya aseguraron en el torneo (decisión 104)', () => {
    // Quiroga: 165 − 15 + 50 = 200. Roa: 120 + 15 = 135. Vera, 110. Bravo: 95 − 50 + 10 = 55.
    const { escenarios, numeroUno } = proyectar(base);
    expect(escenarios.map((e) => e.puesto)).toEqual([4, 3, 2, 2]);
    // Con los demás congelados en lo de hoy, ganar el torneo (175) parecía alcanzar para pasar a Quiroga (165).
    expect(numeroUno).toEqual({
      desde: null,
      rival: { jugadorId: QUIROGA, nombre: 'Tomás', apellido: 'Quiroga', puntos: 200, asegurada: 'semifinalista', sigueEnJuego: true },
    });
  });

  it('dice desde qué instancia queda primero, aunque sea compartido', () => {
    // Quiroga perdió en cuartos: 165 − 15 + 25 = 175, lo mismo que yo si gano el torneo.
    const alcanzables = new Map(base.alcanzables).set(QUIROGA, ['cuartos']);
    const { escenarios, numeroUno } = proyectar({ ...base, alcanzables });
    expect(escenarios.at(-1)).toMatchObject({ instancia: 'campeon', acumulado: 175, puesto: 1 });
    expect(numeroUno.desde).toBe('campeon');
    expect(numeroUno.rival).toMatchObject({ jugadorId: QUIROGA, puntos: 175, asegurada: 'cuartos', sigueEnJuego: false });
  });

  it('el rival por el primer puesto puede no jugar el torneo', () => {
    const alcanzables = new Map<number, Instancia[]>([[YO, cuartosEnAdelante]]);
    const { numeroUno } = proyectar({ ...base, alcanzables });
    expect(numeroUno.desde).toBe('campeon');
    expect(numeroUno.rival).toMatchObject({ jugadorId: QUIROGA, puntos: 165, asegurada: null, sigueEnJuego: false });
  });

  it('con el torneo definido hay un solo escenario', () => {
    const alcanzables = new Map(base.alcanzables).set(YO, ['cuartos']);
    const proyeccion = proyectar({ ...base, alcanzables });
    expect(proyeccion.definido).toBe(true);
    expect(proyeccion.escenarios).toEqual([{ instancia: 'cuartos', puntos: 25, acumulado: 100, puesto: 4 }]);
  });

  it('sin nada en el casillero no defiende puntos: lo que saque se suma', () => {
    const sinOtono = movimientos.filter((m) => !(m.jugadorId === YO && m.etapaId === OTONO));
    const proyeccion = proyectar({ ...base, movimientos: sinOtono });
    expect(proyeccion.defiende).toBeNull();
    expect(proyeccion.hoy.puntos).toBe(75);
    expect(proyeccion.escenarios[0]).toMatchObject({ instancia: 'cuartos', acumulado: 100 });
  });

  it('quien hoy no está en la categoría tiene puntos pero no puesto', () => {
    const proyeccion = proyectar({ ...base, deLaCategoria: deLaCategoria.filter((j) => j.id !== YO) });
    expect(proyeccion.hoy).toEqual({ puntos: 85, puesto: null });
    expect(proyeccion.escenarios.every((e) => e.puesto === null)).toBe(true);
    expect(proyeccion.numeroUno.desde).toBeNull();
  });

  it('solo en la categoría no tiene rival', () => {
    const proyeccion = proyectar({ ...base, deLaCategoria: [deLaCategoria[0]], alcanzables: new Map([[YO, cuartosEnAdelante]]) });
    expect(proyeccion.numeroUno).toEqual({ desde: 'cuartos', rival: null });
  });
});
