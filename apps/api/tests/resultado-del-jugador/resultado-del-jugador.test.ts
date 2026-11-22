import { resultadoDelJugadorSchema } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import {
  ganadorDeLaPropuesta,
  problemaAlCargar,
  problemaAlResponder,
  propuestaVigente,
  type PartidoParaCargar,
  type PropuestaLeida,
} from '../../src/modules/resultado-del-jugador/resultado-del-jugador';

const YO = 1;
const RIVAL = 2;
const partido = (datos: Partial<PartidoParaCargar> = {}): PartidoParaCargar => ({
  jugadorAId: YO,
  jugadorBId: RIVAL,
  estado: 'CONFIRMADA',
  ...datos,
});
const set = (gamesA: number, gamesB: number) => ({ gamesA, gamesB, tieBreakA: null, tieBreakB: null, esSuperTieBreak: false });
const sets = [set(6, 3), set(6, 4)];
let id = 1;
const propuesta = (jugadorId: number, estado: PropuestaLeida['estado'] = 'PENDIENTE'): PropuestaLeida => ({
  id: id++,
  jugadorId,
  estado,
  datos: { tipo: 'jugado', sets },
});

describe('problemaAlCargar', () => {
  it('puede cargar su partido sin resultado, si la organización lo permite', () => {
    expect(problemaAlCargar(partido(), YO, true, [])).toBeNull();
  });

  it('con la carga solo de la organización, no puede', () => {
    expect(problemaAlCargar(partido(), YO, false, [])).toBe('LA_ORGANIZACION_CARGA_LOS_RESULTADOS');
  });

  it('un resultado que ya cuenta lo corrige la organización, no el jugador', () => {
    expect(problemaAlCargar(partido({ estado: 'JUGADA' }), YO, true, [])).toBe('PARTIDO_CON_RESULTADO');
    expect(problemaAlCargar(partido({ estado: 'WALKOVER' }), YO, true, [])).toBe('PARTIDO_CON_RESULTADO');
  });

  it('en un cuadro, espera a que esté el rival', () => {
    expect(problemaAlCargar(partido({ jugadorBId: null }), YO, true, [])).toBe('PARTIDO_SIN_JUGADORES');
  });

  it('si el rival ya cargó uno pendiente, primero lo responde; el suyo propio lo puede reemplazar', () => {
    expect(problemaAlCargar(partido(), YO, true, [propuesta(RIVAL)])).toBe('EL_RIVAL_YA_CARGO_EL_RESULTADO');
    expect(problemaAlCargar(partido(), YO, true, [propuesta(YO)])).toBeNull();
  });

  it('después de un rechazo, cualquiera de los dos lo vuelve a cargar', () => {
    expect(problemaAlCargar(partido(), YO, true, [propuesta(RIVAL, 'RECHAZADO')])).toBeNull();
  });
});

describe('problemaAlResponder', () => {
  it('confirma o rechaza el que no lo cargó', () => {
    expect(problemaAlResponder(partido(), YO, [propuesta(RIVAL)])).toBeNull();
    expect(problemaAlResponder(partido(), YO, [propuesta(YO)])).toBe('LO_CARGASTE_VOS');
  });

  it('sin uno pendiente no hay nada que responder', () => {
    expect(problemaAlResponder(partido(), YO, [])).toBe('SIN_RESULTADO_PENDIENTE');
    expect(problemaAlResponder(partido(), YO, [propuesta(RIVAL, 'RECHAZADO')])).toBe('SIN_RESULTADO_PENDIENTE');
  });

  it('si el partido ya tiene resultado, tampoco', () => {
    expect(problemaAlResponder(partido({ estado: 'JUGADA' }), YO, [propuesta(RIVAL)])).toBe('PARTIDO_CON_RESULTADO');
  });
});

describe('propuestaVigente', () => {
  it('la pendiente antes que cualquier rechazada, y si no hay, la última rechazada', () => {
    const vieja = propuesta(YO, 'RECHAZADO');
    const nueva = propuesta(RIVAL, 'RECHAZADO');
    const pendiente = propuesta(YO);
    expect(propuestaVigente([vieja, pendiente, nueva])).toBe(pendiente);
    expect(propuestaVigente([vieja, nueva])).toBe(nueva);
    expect(propuestaVigente([propuesta(YO, 'REEMPLAZADO')])).toBeNull();
  });
});

describe('ganadorDeLaPropuesta', () => {
  it('en un partido jugado sale de los sets; en un abandono, es quien siguió', () => {
    expect(ganadorDeLaPropuesta({ tipo: 'jugado', sets }, YO, RIVAL)).toBe(YO);
    expect(ganadorDeLaPropuesta({ tipo: 'abandono', ganadorId: RIVAL }, YO, RIVAL)).toBe(RIVAL);
  });
});

describe('resultadoDelJugadorSchema', () => {
  it('el jugador no puede cargar un W.O.: lo decide la organización', () => {
    expect(resultadoDelJugadorSchema.safeParse({ tipo: 'walkover', ganadorId: YO }).success).toBe(false);
    expect(resultadoDelJugadorSchema.safeParse({ tipo: 'abandono', ganadorId: YO }).success).toBe(true);
  });
});
