import type { SistemaDeJuego } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import {
  auditarLectura,
  auditarResultado,
  nombresRepetidos,
  problemasGlobales,
  type ContextoAuditoria,
  type PartidoAuditable,
} from '../../src/modules/competencia/mensajes/auditar';
import { leerChat } from '../../src/modules/competencia/mensajes/leer-chat';
import type { ResultadoDeLaIA } from '../../src/modules/competencia/mensajes/schema-respuesta';

describe('leerChat', () => {
  it('separa los mensajes copiados del celular, con quién los mandó, y une las líneas que siguen', () => {
    const chat = leerChat(
      [
        '[20/11/26, 18:03:12] Diego Antileo: perdí 46 36',
        '‎[20/11/26, 18:10:01] Juan Paz: ¿alguien juega el jueves?',
        'a la tarde',
        '20/11/26 19:00 - Martín Sanhueza: le gané a Paz 6-4 6-3',
        '[19:30, 20/11/2026] Ana Ruiz: W.O. de Sosa',
      ].join('\n'),
    );
    expect(chat).toEqual([
      { numero: 1, hora: '18:03', remitente: 'Diego Antileo', texto: 'perdí 46 36' },
      { numero: 2, hora: '18:10', remitente: 'Juan Paz', texto: '¿alguien juega el jueves?\na la tarde' },
      { numero: 3, hora: '19:00', remitente: 'Martín Sanhueza', texto: 'le gané a Paz 6-4 6-3' },
      { numero: 4, hora: '19:30', remitente: 'Ana Ruiz', texto: 'W.O. de Sosa' },
    ]);
  });

  it('sin encabezados, cada línea es un mensaje sin remitente', () => {
    expect(leerChat('Antileo 6-4 6-3 a Sanhueza\n\nPaz y Ruiz 7-5 6-2')).toEqual([
      { numero: 1, hora: null, remitente: null, texto: 'Antileo 6-4 6-3 a Sanhueza' },
      { numero: 2, hora: null, remitente: null, texto: 'Paz y Ruiz 7-5 6-2' },
    ]);
  });
});

const POLENTA: SistemaDeJuego = { setsPorPartido: 3, terceroSet: 'super_tiebreak', gamesPorSet: 6, puntosTieBreak: 7, puntosSuperTieBreak: 10 };

const antileo = { id: 1, nombre: 'Diego', apellido: 'Antileo' };
const sanhueza = { id: 2, nombre: 'Martín', apellido: 'Sanhueza' };
const paz = { id: 3, nombre: 'Juan', apellido: 'Paz' };
const ruiz = { id: 4, nombre: 'Martín', apellido: 'Ruiz' };

const partido = (id: number, a: typeof antileo, b: typeof antileo, extra: Partial<PartidoAuditable> = {}): PartidoAuditable => ({
  id,
  jugadorA: a,
  jugadorB: b,
  estado: 'otro',
  ganadorId: null,
  sets: [],
  ...extra,
});

function contexto(textos: [string | null, string][]): ContextoAuditoria {
  return {
    mensajes: new Map(textos.map(([remitente, texto], i) => [i + 1, { numero: i + 1, hora: null, remitente, texto }])),
    partidos: new Map([
      [10, partido(10, antileo, sanhueza)],
      [11, partido(11, paz, ruiz)],
    ]),
    sistema: POLENTA,
    repetidos: nombresRepetidos([antileo, sanhueza, paz, ruiz]),
  };
}

const jugado = (mensaje: number, partidoId: number | null, sets: [number, number, boolean?][], extra: Partial<ResultadoDeLaIA> = {}): ResultadoDeLaIA => ({
  mensaje,
  partidoId,
  tipo: 'jugado',
  ganador: null,
  sets: sets.map(([gamesA, gamesB, esSuperTieBreak = false]) => ({ gamesA, gamesB, esSuperTieBreak })),
  confianza: 'alta',
  ...extra,
});

describe('auditarResultado', () => {
  it('carga solo un resultado en primera persona, con el marcador sin separadores, orientado a A y B', () => {
    // Antileo es A y perdió: A 4-6 3-6.
    const auditado = auditarResultado(jugado(1, 10, [[4, 6], [3, 6]]), contexto([['Diego Antileo', 'Perdí con Sanhueza 46 36']]));
    expect(auditado).toMatchObject({ estado: 'seguro', motivo: null });
  });

  it('carga solo el super tie-break del set decisivo', () => {
    const ctx = contexto([[null, 'Antileo le ganó a Sanhueza 6-4 3-6 10-8']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [3, 6], [10, 8, true]]), ctx).estado).toBe('seguro');
  });

  it('manda a revisión un set que no está en el mensaje', () => {
    const ctx = contexto([[null, 'Antileo le ganó a Sanhueza 6-4 6-3']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [6, 2]]), ctx).motivo).toBe('El marcador no está escrito así en el mensaje');
  });

  it('manda a revisión un marcador que no es válido en el torneo', () => {
    const ctx = contexto([[null, 'Antileo Sanhueza 6-4 5-6']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [5, 6]]), ctx).estado).toBe('a_revisar');
  });

  it('manda a revisión cuando falta uno de los dos y quien lo manda no jugó', () => {
    const ctx = contexto([['Juan Paz', 'Antileo ganó 6-4 6-3']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [6, 3]]), ctx).motivo).toBe('No nombra a Sanhueza, y lo manda alguien que no jugó');
  });

  it('no toma un nombre de pila que se repite en el torneo', () => {
    // Hay dos Martín: "2-0 con Martín" no dice cuál.
    const ctx = contexto([['Diego Antileo', 'Le gané a Martín 6-4 6-3']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [6, 3]]), ctx).motivo).toBe('El mensaje no nombra a Sanhueza');
  });

  it('manda a revisión si quien dice "le gané" es el que perdió según los sets', () => {
    const ctx = contexto([['Martín Sanhueza', 'Le gané a Antileo 6-4 6-3']]);
    // La IA lo orientó al revés: A (Antileo) ganó.
    const auditado = auditarResultado(jugado(1, 10, [[6, 4], [6, 3]]), ctx);
    expect(auditado.motivo).toBe('Quien lo manda dice lo contrario de lo que leímos');
    // Lo que se propone cargar es lo que dice el mensaje: ganó Sanhueza (B).
    expect(auditado.resultado).toMatchObject({ tipo: 'jugado', sets: [{ gamesA: 4, gamesB: 6 }, { gamesA: 3, gamesB: 6 }] });
  });

  it('un abandono va a revisión si el mensaje dice que abandonó el que leímos como ganador', () => {
    // Le pasó a la organización al probar: "Villalobos abandonó" se cargó solo con Villalobos ganador.
    const abandono = { mensaje: 1, partidoId: 10, tipo: 'abandono' as const, ganador: 'B' as const, sets: [], confianza: 'alta' as const };
    const ctx = contexto([['Diego Antileo', 'Sanhueza abandonó en el segundo set, íbamos 6-4 2-1 para mí']]);
    const auditado = auditarResultado(abandono, ctx);
    expect(auditado).toMatchObject({ estado: 'a_revisar', motivo: 'El mensaje dice que abandonó Sanhueza', resultado: { tipo: 'abandono', ganadorId: antileo.id } });
    expect(auditarResultado({ ...abandono, ganador: 'A' }, ctx).estado).toBe('seguro');
  });

  it('en un W.O. o un abandono, el texto tiene que decir quién no siguió', () => {
    const wo = { mensaje: 1, partidoId: 11, tipo: 'walkover' as const, ganador: 'B' as const, sets: [], confianza: 'alta' as const };
    expect(auditarResultado(wo, contexto([[null, 'Paz no se presentó, W.O. para Ruiz']])).estado).toBe('seguro');
    expect(auditarResultado(wo, contexto([[null, 'Hubo W.O. entre Paz y Ruiz']])).motivo).toBe('El mensaje no dice quién no se presentó');
    // "Me retiré": no siguió quien lo manda.
    const abandono = { ...wo, tipo: 'abandono' as const };
    expect(auditarResultado(abandono, contexto([['Juan Paz', 'Con Ruiz me retiré en el primero, me lesioné']])).estado).toBe('seguro');
    expect(auditarResultado(abandono, contexto([['Martín Ruiz', 'Con Paz me retiré en el primero']])).motivo).toBe('El mensaje dice que abandonó Ruiz');
  });

  it('un W.O. se carga solo si el mensaje lo dice', () => {
    const wo = { mensaje: 1, partidoId: 11, tipo: 'walkover' as const, ganador: 'B' as const, sets: [], confianza: 'alta' as const };
    expect(auditarResultado(wo, contexto([[null, 'W.O. de Paz, gana Ruiz']])).estado).toBe('seguro');
    expect(auditarResultado(wo, contexto([[null, 'Ruiz le ganó a Paz']])).motivo).toBe('El mensaje no dice que fue W.O.');
  });

  it('distingue el partido que ya tiene este resultado del que tiene otro', () => {
    const ctx = contexto([[null, 'Antileo a Sanhueza 6-4 6-3']]);
    ctx.partidos.set(10, partido(10, antileo, sanhueza, { estado: 'jugada', ganadorId: 1, sets: [{ gamesA: 6, gamesB: 4, tieBreakA: null, tieBreakB: null, esSuperTieBreak: false }, { gamesA: 6, gamesB: 3, tieBreakA: null, tieBreakB: null, esSuperTieBreak: false }] }));
    expect(auditarResultado(jugado(1, 10, [[6, 4], [6, 3]]), ctx).estado).toBe('ya_estaba');
    expect(auditarResultado(jugado(1, 10, [[6, 3], [6, 4]]), contexto([[null, 'Antileo a Sanhueza 6-3 6-4']])).estado).toBe('seguro');
    const otro = contexto([[null, 'Antileo a Sanhueza 6-3 6-4']]);
    otro.partidos.set(10, ctx.partidos.get(10)!);
    expect(auditarResultado(jugado(1, 10, [[6, 3], [6, 4]]), otro).motivo).toBe('El partido ya tiene otro resultado cargado');
  });

  it('sin partido, sin sets o con confianza baja, va a revisión', () => {
    const ctx = contexto([[null, 'Antileo a Sanhueza 2-0']]);
    expect(auditarResultado(jugado(1, null, []), ctx).motivo).toBe('No encontramos de qué partido es');
    expect(auditarResultado(jugado(1, 10, []), ctx).motivo).toBe('No pudimos leer el resultado');
    const dudoso = contexto([[null, 'Antileo a Sanhueza 6-4 6-3']]);
    expect(auditarResultado(jugado(1, 10, [[6, 4], [6, 3]], { confianza: 'media' }), dudoso).motivo).toBe('No es seguro cómo se leyó el mensaje');
  });
});

describe('auditarLectura', () => {
  it('un mismo partido en dos mensajes va a revisión en los dos', () => {
    const ctx = contexto([
      [null, 'Antileo a Sanhueza 6-4 6-3'],
      [null, 'Antileo le ganó a Sanhueza 6-4 6-3'],
    ]);
    const auditados = auditarLectura({ resultados: [jugado(1, 10, [[6, 4], [6, 3]]), jugado(2, 10, [[6, 4], [6, 3]])] }, ctx);
    expect(auditados.map((a) => a.motivo)).toEqual(['El partido aparece en dos mensajes', 'El partido aparece en dos mensajes']);
  });

  it('reintenta una respuesta con mensajes o partidos que no existen', () => {
    const ctx = contexto([[null, 'Antileo a Sanhueza 6-4 6-3']]);
    expect(problemasGlobales({ resultados: [jugado(7, 99, [[6, 4]])] }, ctx)).toEqual([
      'Estos mensajes no existen: 7',
      'Estos partidos no están en la lista: 99',
    ]);
  });
});

describe('los chats del eval', () => {
  it('con la lectura perfecta, la auditoría carga solo justo lo que se espera', async () => {
    const { chatsDePrueba, contextoDe, respuestaPerfecta } = await import('../fixtures/mensajes/fixture');
    for (const prueba of chatsDePrueba()) {
      const { contexto } = contextoDe(prueba);
      const auditados = auditarLectura({ resultados: respuestaPerfecta(prueba) }, contexto);
      const seCargan = auditados.map((a, i) => [prueba.esperado[i].mensaje, a.estado === 'seguro']);
      expect(seCargan, prueba.nombre).toEqual(prueba.esperado.map((e) => [e.mensaje, e.seCargaSolo]));
    }
  });
});
