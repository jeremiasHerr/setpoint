import { coincideConElNombre } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';

const juan = { nombre: 'Juan Martín', apellido: 'Pérez' };

describe('coincideConElNombre', () => {
  it('encuentra por el nombre, por el apellido o por los dos, en cualquier orden', () => {
    expect(coincideConElNombre(juan, 'juan')).toBe(true);
    expect(coincideConElNombre(juan, 'perez')).toBe(true);
    expect(coincideConElNombre(juan, 'Juan Pérez')).toBe(true);
    expect(coincideConElNombre(juan, 'pérez juan')).toBe(true);
  });

  it('acepta el comienzo o un pedazo de cada palabra, sin tildes ni mayúsculas', () => {
    expect(coincideConElNombre(juan, 'ju pe')).toBe(true);
    expect(coincideConElNombre(juan, 'MARTIN')).toBe(true);
    expect(coincideConElNombre({ nombre: 'Lucas', apellido: 'Quilodrán' }, 'quilodran')).toBe(true);
  });

  it('pide que estén todas las palabras escritas', () => {
    expect(coincideConElNombre(juan, 'juan gomez')).toBe(false);
    expect(coincideConElNombre(juan, 'pedro')).toBe(false);
  });

  it('sin nada escrito coinciden todos', () => {
    expect(coincideConElNombre(juan, '')).toBe(true);
    expect(coincideConElNombre(juan, '   ')).toBe(true);
  });
});
