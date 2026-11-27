import { EstadoTorneo } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { faseDelTorneo } from '../../src/modules/torneos/torneo-publico';

// En qué parte del cronograma de la página del torneo está cada estado (decisión 160).
describe('faseDelTorneo', () => {
  it.each([
    [EstadoTorneo.PUBLICADO, 'inscripcion'],
    [EstadoTorneo.INSCRIPCIONES_CERRADAS, 'sorteo'],
    [EstadoTorneo.ZONAS_GENERADAS, 'zonas'],
    [EstadoTorneo.GRUPOS_EN_CURSO, 'zonas'],
    [EstadoTorneo.ELIMINATORIAS, 'cuadros'],
    [EstadoTorneo.FINALIZADO, 'terminado'],
  ] as const)('%s está en %s', (estado, fase) => {
    expect(faseDelTorneo(estado)).toBe(fase);
  });
});
