import type { DatosBaja, DatosInscripcionManual, InscripcionesDelTorneo } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// El id es el de un torneo (una categoría), no el de la convocatoria: cada categoría cierra aparte.
const ruta = (slug: string, id: number) => `/api/organizaciones/${slug}/torneos/${id}/inscripciones`;

export function obtenerInscripciones(slug: string, id: number) {
  return pedir<InscripcionesDelTorneo>('GET', ruta(slug, id));
}

// Las dos devuelven las inscripciones como quedaron, con las solicitudes (decisión 054).
export function aprobarSolicitud(slug: string, id: number, inscripcionId: number) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/${inscripcionId}/aprobar`);
}

export function rechazarSolicitud(slug: string, id: number, inscripcionId: number) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/${inscripcionId}/rechazar`);
}

export function cerrarInscripcion(slug: string, id: number) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/cerrar`);
}

// Las de F13 completa también devuelven las inscripciones como quedaron.
export function darDeBaja(slug: string, id: number, inscripcionId: number, datos: DatosBaja) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/${inscripcionId}/baja`, datos);
}

export function marcarDevolucion(slug: string, id: number, inscripcionId: number) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/${inscripcionId}/devolucion`);
}

export function recordarPago(slug: string, id: number, inscripcionId: number) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/${inscripcionId}/recordatorio`);
}

export function inscribirAMano(slug: string, id: number, datos: DatosInscripcionManual) {
  return pedir<InscripcionesDelTorneo>('POST', `${ruta(slug, id)}/manual`, datos);
}
