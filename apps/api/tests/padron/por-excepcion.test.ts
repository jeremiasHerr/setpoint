import type { FilaExtraida } from '@setpoint/shared';
import { describe, expect, it } from 'vitest';
import {
  apellidosNormalizados,
  filasARevisar,
  motivoDeRevision,
} from '../../src/modules/padron/importacion/por-excepcion';

function fila(numero: number, apellido: string, coincideCon: number | null, confianza: FilaExtraida['confianza']): FilaExtraida {
  return {
    fila: numero,
    nombre: 'Nombre',
    apellido,
    casilleros: [{ etapa: 'Primavera', anio: 2025, puntos: 10 }],
    acumulado: null,
    coincideCon,
    confianza,
  };
}

const LIMPIA = { globales: [], porFila: [] };
const PADRON = apellidosNormalizados([{ apellido: 'Pérez' }, { apellido: 'QUILODRÁN' }]);

describe('motivoDeRevision', () => {
  it('importa solo a quien coincide con confianza alta', () => {
    expect(motivoDeRevision(fila(4, 'Pérez', 1, 'alta'), LIMPIA, PADRON)).toBeNull();
  });

  it('manda a revisión las coincidencias de confianza media o baja', () => {
    expect(motivoDeRevision(fila(4, 'Pérez', 1, 'media'), LIMPIA, PADRON)).toMatch(/No es seguro/);
    expect(motivoDeRevision(fila(4, 'Pérez', 1, 'baja'), LIMPIA, PADRON)).toMatch(/No es seguro/);
  });

  it('importa solo al nuevo con un apellido que no está en el padrón', () => {
    expect(motivoDeRevision(fila(4, 'Painemil', null, null), LIMPIA, PADRON)).toBeNull();
  });

  it('manda a revisión al nuevo con un apellido del padrón, sin tildes ni mayúsculas', () => {
    expect(motivoDeRevision(fila(4, 'PEREZ', null, null), LIMPIA, PADRON)).toBe('Ya hay un PEREZ en el padrón');
    expect(motivoDeRevision(fila(4, 'quilodran', null, null), LIMPIA, PADRON)).toMatch(/Ya hay un/);
  });

  it('manda a revisión la fila con un problema de auditoría, con su detalle, aunque coincida', () => {
    const auditoria = { globales: [], porFila: [{ fila: 4, detalle: 'Fila 4: el 75 no está en la planilla' }] };
    expect(motivoDeRevision(fila(4, 'Pérez', 1, 'alta'), auditoria, PADRON)).toBe('Fila 4: el 75 no está en la planilla');
    expect(motivoDeRevision(fila(5, 'Pérez', 1, 'alta'), auditoria, PADRON)).toBeNull();
  });

  it('con un problema de toda la hoja no importa ninguna fila sola', () => {
    const auditoria = { globales: [{ fila: null, detalle: 'Faltan jugadores' }], porFila: [] };
    expect(motivoDeRevision(fila(4, 'Painemil', null, null), auditoria, PADRON)).not.toBeNull();
  });
});

describe('filasARevisar', () => {
  it('devuelve solo las que van a revisión, por número de fila', () => {
    const propuesta = [fila(4, 'Pérez', 1, 'alta'), fila(5, 'Pérez', null, null), fila(6, 'Sosa', null, null)];
    expect(filasARevisar(propuesta, LIMPIA, PADRON)).toEqual({ 5: 'Ya hay un Pérez en el padrón' });
  });
});
