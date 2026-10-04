import { describe, expect, it } from 'vitest';
import { convocatoriaSchema } from '@setpoint/shared';

const minima = { nombre: 'Torneo Primavera 26', categorias: [{ categoria: 'Tercera', cupo: 32 }] };

function errores(datos: unknown) {
  const resultado = convocatoriaSchema.safeParse(datos);
  return resultado.success ? [] : resultado.error.issues.map((i) => i.path.join('.'));
}

describe('convocatoriaSchema', () => {
  it('completa con los valores de POLENTA lo que no llega', () => {
    const datos = convocatoriaSchema.parse(minima);
    expect(datos).toMatchObject({
      etapa: null,
      cantidadGrupos: 8,
      clasificanPorGrupo: 2,
      tieneComplementaria: true,
      setsPorPartido: 3,
      puntoDeOro: true,
      terceroSet: 'super_tiebreak',
      plazoGruposDias: 21,
      plazoPorRondaDias: 7,
      modoInscripcion: 'cerrada',
      sedeGrupos: 'libre',
      sedeEliminatorias: 'designada',
    });
  });

  it('pide al menos una categoría', () => {
    expect(errores({ ...minima, categorias: [] })).toContain('categorias');
  });

  it('rechaza categorías repetidas sin importar mayúsculas', () => {
    const categorias = [
      { categoria: 'Tercera', cupo: 32 },
      { categoria: 'tercera', cupo: 16 },
    ];
    expect(errores({ ...minima, categorias })).toContain('categorias');
  });

  it('no deja un cupo mayor a los lugares de los grupos', () => {
    expect(errores({ ...minima, cantidadGrupos: 4 })).toContain('categorias.0.cupo');
    expect(errores({ ...minima, cantidadGrupos: 8 })).toEqual([]);
  });

  it('no deja clasificar a los cuatro del grupo', () => {
    expect(errores({ ...minima, clasificanPorGrupo: 4 })).toContain('clasificanPorGrupo');
  });

  it('pide que la inscripción cierre antes del inicio', () => {
    const fechas = { cierreInscripcion: '2026-10-10', fechaInicio: '2026-10-06' };
    expect(errores({ ...minima, ...fechas })).toContain('cierreInscripcion');
    expect(errores({ ...minima, cierreInscripcion: '2026-09-26', fechaInicio: '2026-10-06' })).toEqual([]);
  });

  it('solo acepta partidos al mejor de 3 o de 5', () => {
    expect(errores({ ...minima, setsPorPartido: 4 })).toContain('setsPorPartido');
  });
});
