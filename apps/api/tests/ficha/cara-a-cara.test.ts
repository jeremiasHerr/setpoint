import { caraACaraParamsSchema } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import { partidosDelCaraACara, resumenDelCaraACara, rivalesConPartidos } from '../../src/modules/ficha/cara-a-cara';
import type { PartidoDeLaFichaLeido, TorneoDeLaFichaLeido } from '../../src/modules/ficha/ficha';

const A = 1;
const B = 2;
const yo = { id: A, nombre: 'Martín', apellido: 'Sanhueza' };
const el = { id: B, nombre: 'Lucas', apellido: 'Bravo' };

let proximoId = 1;
// Por defecto, A es el jugador A del partido; con `alReves`, B figura como jugador A.
function partido(datos: Partial<PartidoDeLaFichaLeido> & { alReves?: boolean }): PartidoDeLaFichaLeido {
  const { alReves, ...resto } = datos;
  return {
    id: proximoId++,
    torneoId: 10,
    grupo: 'C',
    cuadro: null,
    ronda: null,
    jugadorAId: alReves ? B : A,
    jugadorBId: alReves ? A : B,
    ganadorId: null,
    estado: 'JUGADA',
    fechaAcordada: null,
    jugadorA: alReves ? el : yo,
    jugadorB: alReves ? yo : el,
    sets: [],
    ...resto,
  };
}

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

const set63 = [
  { gamesA: 6, gamesB: 3 },
  { gamesA: 6, gamesB: 4 },
];

describe('resumenDelCaraACara', () => {
  it('cuenta los ganados por cada uno, sin importar de qué lado figuraba', () => {
    const resumen = resumenDelCaraACara(A, [
      partido({ ganadorId: A }),
      partido({ ganadorId: A, alReves: true }),
      partido({ ganadorId: B }),
    ]);
    expect(resumen).toEqual({ jugados: 3, ganadosA: 2, ganadosB: 1, walkovers: 0 });
  });

  it('no cuenta el W.O., que se aclara aparte, pero sí el abandono (decisión 073)', () => {
    const resumen = resumenDelCaraACara(A, [
      partido({ ganadorId: A, estado: 'WALKOVER' }),
      partido({ ganadorId: B, estado: 'ABANDONO' }),
      partido({ ganadorId: A }),
    ]);
    expect(resumen).toEqual({ jugados: 2, ganadosA: 1, ganadosB: 1, walkovers: 1 });
  });

  it('ignora los partidos sin resultado', () => {
    const resumen = resumenDelCaraACara(A, [partido({ estado: 'PENDIENTE_COORDINACION' }), partido({ ganadorId: A })]);
    expect(resumen).toEqual({ jugados: 1, ganadosA: 1, ganadosB: 0, walkovers: 0 });
  });

  it('sin partidos, todo en cero', () => {
    expect(resumenDelCaraACara(A, [])).toEqual({ jugados: 0, ganadosA: 0, ganadosB: 0, walkovers: 0 });
  });
});

describe('partidosDelCaraACara', () => {
  it('da el marcador desde el lado de A y quién ganó', () => {
    const lista = partidosDelCaraACara(A, [torneo({})], [partido({ ganadorId: B, alReves: true, sets: set63 })], []);
    // B figuraba como jugador A y ganó 6-3 6-4: desde el lado de A son los games al revés.
    expect(lista[0]).toMatchObject({ ganador: 'b', marcador: '3-6 4-6', grupo: 'C', cuadro: null });
  });

  it('ordena del torneo más reciente al más viejo, y dentro del torneo por ronda', () => {
    const viejo = torneo({ id: 1, edicion: 'Verano 25', fechaInicio: new Date('2025-01-10') });
    const nuevo = torneo({ id: 2, edicion: 'Invierno 26', fechaInicio: new Date('2026-06-01') });
    const partidos = [
      partido({ torneoId: 1, ganadorId: A }),
      partido({ torneoId: 2, grupo: null, cuadro: 'CAMPEONATO', ronda: 1, ganadorId: A }),
      partido({ torneoId: 2, grupo: null, cuadro: 'CAMPEONATO', ronda: 2, ganadorId: B }),
    ];
    const cuadro = [
      { torneoId: 2, cuadro: 'CAMPEONATO' as const, ronda: 1 },
      { torneoId: 2, cuadro: 'CAMPEONATO' as const, ronda: 2 },
    ];
    const lista = partidosDelCaraACara(A, [viejo, nuevo], partidos, cuadro);
    expect(lista.map((p) => [p.torneo, p.ronda])).toEqual([
      ['Invierno 26', 2],
      ['Invierno 26', 1],
      ['Verano 25', null],
    ]);
    expect(lista[0]).toMatchObject({ cuadro: 'campeonato', rondas: 2, grupo: null });
  });

  it('el W.O. y el abandono figuran, y los partidos sin resultado no', () => {
    const lista = partidosDelCaraACara(
      A,
      [torneo({})],
      [
        partido({ ganadorId: A, estado: 'WALKOVER' }),
        partido({ ganadorId: B, estado: 'ABANDONO' }),
        partido({ estado: 'PENDIENTE_COORDINACION' }),
      ],
      [],
    );
    expect(lista.map((p) => [p.estado, p.marcador]).sort()).toEqual([
      ['abandono', 'ab.'],
      ['walkover', 'W.O.'],
    ]);
  });

  it('no filtra datos de contacto', () => {
    const lista = partidosDelCaraACara(A, [torneo({})], [partido({ ganadorId: A, sets: set63 })], []);
    expect(Object.keys(lista[0]!)).not.toContain('rival');
    expect(JSON.stringify(lista)).not.toMatch(/telefono|email/i);
  });
});

describe('rivalesConPartidos', () => {
  it('cuenta los partidos con resultado por rival, de más a menos', () => {
    const rivales = rivalesConPartidos(A, [
      partido({ ganadorId: A }),
      partido({ ganadorId: A, jugadorBId: 3 }),
      partido({ ganadorId: B, jugadorBId: 3 }),
      partido({ ganadorId: A, alReves: true, jugadorAId: 4, jugadorBId: A }),
      partido({ estado: 'PENDIENTE_COORDINACION', jugadorBId: 5 }),
    ]);
    expect(rivales).toEqual([
      { rivalId: 3, partidos: 2 },
      { rivalId: 2, partidos: 1 },
      { rivalId: 4, partidos: 1 },
    ]);
  });
});

describe('caraACaraParamsSchema', () => {
  it('convierte los ids de la ruta', () => {
    expect(caraACaraParamsSchema.parse({ id: '3', rivalId: '7' })).toEqual({ id: 3, rivalId: 7 });
  });
  it('rechaza compararse con uno mismo y ids que no son números', () => {
    expect(caraACaraParamsSchema.safeParse({ id: '3', rivalId: '3' }).success).toBe(false);
    expect(caraACaraParamsSchema.safeParse({ id: 'x', rivalId: '3' }).success).toBe(false);
  });
});
