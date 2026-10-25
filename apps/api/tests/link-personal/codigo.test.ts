import { describe, expect, it } from 'vitest';
import { nuevoCodigoDeLink, pareceCodigoDeLink } from '../../src/modules/link-personal/codigo';

describe('código del link personal', () => {
  it('sale bien formado y distinto cada vez', () => {
    const codigos = Array.from({ length: 50 }, nuevoCodigoDeLink);
    expect(codigos.every(pareceCodigoDeLink)).toBe(true);
    expect(new Set(codigos).size).toBe(50);
  });

  it('no acepta un id ni algo con otros caracteres', () => {
    expect(pareceCodigoDeLink('42')).toBe(false);
    expect(pareceCodigoDeLink('abcdefghijklmno/')).toBe(false);
    expect(pareceCodigoDeLink('abcdefghijklmnopq')).toBe(false);
  });
});
