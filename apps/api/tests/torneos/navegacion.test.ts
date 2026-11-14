import { EstadoTorneo } from '@prisma/client';
import type { PestanaDelTorneo } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import { convocatoriaEditable, pestanasDisponibles } from '../../src/modules/torneos/navegacion';

// Las pestañas que se pueden abrir, en el orden de la franja.
function abiertas(estado: EstadoTorneo, campeonesDefinidos = false): PestanaDelTorneo[] {
  const disponibles = pestanasDisponibles(estado, campeonesDefinidos);
  return (Object.keys(disponibles) as PestanaDelTorneo[]).filter((p) => disponibles[p]);
}

describe('pestanasDisponibles', () => {
  it('con la inscripción abierta, solo Inscripciones', () => {
    expect(abiertas(EstadoTorneo.PUBLICADO)).toEqual(['inscripciones']);
  });

  it('con la inscripción cerrada, también las zonas para sortear', () => {
    expect(abiertas(EstadoTorneo.INSCRIPCIONES_CERRADAS)).toEqual(['inscripciones', 'zonas']);
  });

  it('desde el sorteo confirmado, el tablero y los resultados', () => {
    const esperadas = ['inscripciones', 'zonas', 'tablero', 'resultados'];
    expect(abiertas(EstadoTorneo.ZONAS_GENERADAS)).toEqual(esperadas);
    expect(abiertas(EstadoTorneo.GRUPOS_EN_CURSO)).toEqual(esperadas);
  });

  it('en los cuadros, el cierre recién con los campeones definidos', () => {
    expect(abiertas(EstadoTorneo.ELIMINATORIAS, false)).not.toContain('cierre');
    expect(abiertas(EstadoTorneo.ELIMINATORIAS, true)).toContain('cierre');
  });

  it('con el torneo cerrado, todas: los resultados se siguen corrigiendo', () => {
    expect(abiertas(EstadoTorneo.FINALIZADO)).toEqual(['inscripciones', 'zonas', 'tablero', 'resultados', 'cierre']);
  });

  it('los campeones definidos no abren el cierre fuera de los cuadros', () => {
    expect(abiertas(EstadoTorneo.GRUPOS_EN_CURSO, true)).not.toContain('cierre');
  });

  it('un torneo cancelado no se sigue', () => {
    expect(abiertas(EstadoTorneo.CANCELADO)).toEqual(['inscripciones']);
  });
});

describe('convocatoriaEditable', () => {
  it('en borrador y con todas las categorías publicadas, sí', () => {
    expect(convocatoriaEditable([EstadoTorneo.BORRADOR, EstadoTorneo.BORRADOR])).toBe(true);
    expect(convocatoriaEditable([EstadoTorneo.PUBLICADO, EstadoTorneo.PUBLICADO])).toBe(true);
  });

  it('si una categoría ya cerró la inscripción, no: el formato es de toda la convocatoria', () => {
    expect(convocatoriaEditable([EstadoTorneo.PUBLICADO, EstadoTorneo.INSCRIPCIONES_CERRADAS])).toBe(false);
  });

  it('desde el sorteo, no', () => {
    expect(convocatoriaEditable([EstadoTorneo.ZONAS_GENERADAS])).toBe(false);
  });
});
