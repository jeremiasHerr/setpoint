import { cortaDe, cruceEnPalabras } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';

describe('cruceEnPalabras', () => {
  it('dice el empate, quién lleva la ventaja y la única vez, en el orden de los cruces', () => {
    const frase = cruceEnPalabras(
      [
        { superficie: 'polvo_ladrillo', jugados: 4, ganadosA: 2, ganadosB: 2 },
        { superficie: 'cemento', jugados: 1, ganadosA: 0, ganadosB: 1 },
        { superficie: 'sintetico', jugados: 3, ganadosA: 1, ganadosB: 2 },
      ],
      'Sanhueza',
      'Bravo',
    );
    expect(frase).toBe(
      'En polvo están 2 a 2. La única vez que jugaron en cemento ganó Bravo. En sintético gana Bravo 2 a 1.',
    );
  });

  it('sin cruces, no dice nada', () => {
    expect(cruceEnPalabras([], 'Sanhueza', 'Bravo')).toBe('');
  });
});

describe('cortaDe', () => {
  it('da la etiqueta que va dentro de una frase', () => {
    expect(cortaDe('polvo_ladrillo')).toBe('polvo');
  });
});
