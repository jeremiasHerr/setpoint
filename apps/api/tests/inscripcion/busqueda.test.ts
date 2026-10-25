import { describe, expect, it } from 'vitest';
import { buscar, coincidencias, esPosibleHomonimo, MAXIMO_DE_RESULTADOS } from '../../src/modules/inscripcion/busqueda';

const p = (id: number, nombre: string, apellido: string) => ({ id, nombre, apellido });

const PADRON = [
  p(1, 'Lucas', 'Bravo'),
  p(2, 'Ariel', 'Huenchul'),
  p(3, 'Nahuel', 'Huenchupán'),
  p(4, 'Juan', 'Pérez'),
  p(5, 'Juan', 'Pérez'),
  p(6, 'Martín', 'Pérez Lagos'),
];

describe('búsqueda en el padrón', () => {
  it('no busca con menos de 3 letras', () => {
    expect(buscar(PADRON, 'hu')).toEqual([]);
  });

  it('encuentra por cualquier parte del apellido, sin tildes ni mayúsculas', () => {
    expect(buscar(PADRON, 'HUEN').map((j) => j.id)).toEqual([2, 3]);
    expect(buscar(PADRON, 'perez').map((j) => j.id)).toEqual([4, 5, 6]);
  });

  it('palabra por palabra: el segundo nombre de más no impide encontrarlo', () => {
    expect(coincidencias(p(1, 'Lucas', 'Bravo'), 'Lucas Matías Bravo')).toBe(2);
    expect(buscar(PADRON, 'Lucas Matías Bravo')[0].id).toBe(1);
  });

  it('primero los que coinciden en más palabras', () => {
    expect(buscar(PADRON, 'martin perez')[0].id).toBe(6);
  });

  it('devuelve como mucho 5', () => {
    const muchos = Array.from({ length: 9 }, (_, i) => p(i, 'Juan', `García ${i}`));
    expect(buscar(muchos, 'garcia')).toHaveLength(MAXIMO_DE_RESULTADOS);
  });
});

describe('posible homónimo', () => {
  it('mismo nombre y apellido en la categoría', () => {
    expect(esPosibleHomonimo(p(4, 'Juan', 'Pérez'), PADRON)).toBe(true);
  });

  it('mismo apellido y misma inicial: "Martín" y "Matías"', () => {
    expect(esPosibleHomonimo(p(7, 'Matías', 'Huenchul'), [p(8, 'Mariano', 'huenchul')])).toBe(true);
  });

  it('mismo apellido con otra inicial no es homónimo', () => {
    expect(esPosibleHomonimo(p(2, 'Ariel', 'Huenchul'), [p(9, 'Nahuel', 'Huenchul')])).toBe(false);
  });

  it('no se compara consigo mismo', () => {
    expect(esPosibleHomonimo(p(1, 'Lucas', 'Bravo'), PADRON)).toBe(false);
  });
});
