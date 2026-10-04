import type { Convocatoria, DatosConvocatoria } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// El id es el del primer torneo de la convocatoria (ver docs/decisiones/003).
const ruta = (slug: string, id?: number) => `/api/organizaciones/${slug}/torneos${id === undefined ? '' : `/${id}`}`;

export function crearConvocatoria(slug: string, datos: DatosConvocatoria) {
  return pedir<Convocatoria>('POST', ruta(slug), datos);
}

export function obtenerConvocatoria(slug: string, id: number) {
  return pedir<Convocatoria>('GET', ruta(slug, id));
}

export function editarConvocatoria(slug: string, id: number, datos: DatosConvocatoria) {
  return pedir<Convocatoria>('PUT', ruta(slug, id), datos);
}

export function publicarConvocatoria(slug: string, id: number) {
  return pedir<Convocatoria>('POST', `${ruta(slug, id)}/publicar`);
}
