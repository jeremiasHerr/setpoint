import type { Convocatoria, DatosConvocatoria, NavegacionDelTorneo } from '@setpoint/shared';
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

// La franja de pestañas de las pantallas del torneo (decisión 095). Acá el id es el de un torneo
// (una categoría), no el de la convocatoria: cada categoría avanza por separado.
export function obtenerNavegacion(slug: string, id: number) {
  return pedir<NavegacionDelTorneo>('GET', `${ruta(slug, id)}/navegacion`);
}
