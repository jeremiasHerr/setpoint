import { describe, expect, it } from 'vitest';
import { configuracionCircuitoSchema } from '@setpoint/shared';

const minima = {
  nombre: 'POLENTA Team Tenis',
  contacto: '',
  usaRanking: false,
  categorias: ['Segunda', 'Tercera'],
  etapas: [],
  puntos: { campeon: 100, finalista: 75, semifinalista: 50, cuartos: 25, octavos: 15, participacion: 10 },
};

const club = { nombre: 'Alta Barda', canchas: [{ nombre: 'Cancha 1', superficie: 'polvo_ladrillo' }] };

function errores(datos: unknown) {
  const resultado = configuracionCircuitoSchema.safeParse(datos);
  return resultado.success ? [] : resultado.error.issues.map((i) => i.path.join('.'));
}

describe('configuracionCircuitoSchema', () => {
  it('los clubes son opcionales: sin ellos el circuito queda sin clubes', () => {
    expect(configuracionCircuitoSchema.parse(minima).clubes).toEqual([]);
  });

  it('pide el nombre del circuito', () => {
    expect(errores({ ...minima, nombre: ' ' })).toContain('nombre');
  });

  it('rechaza categorías repetidas sin importar mayúsculas', () => {
    expect(errores({ ...minima, categorias: ['Tercera', 'tercera'] })).toContain('categorias');
  });

  it('acepta un club sin dirección y sin canchas', () => {
    const datos = configuracionCircuitoSchema.parse({ ...minima, clubes: [{ nombre: 'Alta Barda' }] });
    expect(datos.clubes).toEqual([{ nombre: 'Alta Barda', direccion: '', canchas: [] }]);
  });

  it('conserva el id de los clubes y canchas que ya existen', () => {
    const conIds = { id: 7, ...club, canchas: [{ id: 3, ...club.canchas[0] }] };
    const datos = configuracionCircuitoSchema.parse({ ...minima, clubes: [conIds] });
    expect(datos.clubes[0].id).toBe(7);
    expect(datos.clubes[0].canchas[0].id).toBe(3);
  });

  it('rechaza clubes repetidos sin importar mayúsculas', () => {
    expect(errores({ ...minima, clubes: [club, { ...club, nombre: 'ALTA BARDA' }] })).toContain('clubes');
  });

  it('rechaza canchas repetidas dentro de un club, pero no entre clubes', () => {
    const repetidas = { ...club, canchas: [club.canchas[0], club.canchas[0]] };
    expect(errores({ ...minima, clubes: [repetidas] })).toContain('clubes.0.canchas');
    expect(errores({ ...minima, clubes: [club, { ...club, nombre: 'Biguá' }] })).toEqual([]);
  });

  it('pide el nombre del club y de la cancha', () => {
    expect(errores({ ...minima, clubes: [{ ...club, nombre: '' }] })).toContain('clubes.0.nombre');
    const sinNombre = { ...club, canchas: [{ nombre: '', superficie: 'cemento' }] };
    expect(errores({ ...minima, clubes: [sinNombre] })).toContain('clubes.0.canchas.0.nombre');
  });

  it('solo acepta las superficies conocidas', () => {
    const cesped = { ...club, canchas: [{ nombre: 'Central', superficie: 'cesped' }] };
    expect(errores({ ...minima, clubes: [cesped] })).toContain('clubes.0.canchas.0.superficie');
  });
});
