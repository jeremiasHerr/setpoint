import type { DatosDecidirResultadoLeido, LecturaDeMensajes } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// F19: los resultados desde los mensajes del grupo (decisión 119).
const ruta = (slug: string, id: number) => `/api/organizaciones/${slug}/torneos/${id}/mensajes`;

// Tarda unos segundos: la API lee los mensajes con IA y carga lo seguro antes de responder.
export function leerMensajes(slug: string, id: number, texto: string) {
  return pedir<LecturaDeMensajes>('POST', ruta(slug, id), { texto });
}

export function obtenerLectura(slug: string, id: number, lectura: number) {
  return pedir<LecturaDeMensajes>('GET', `${ruta(slug, id)}/${lectura}`);
}

export function decidirResultado(slug: string, id: number, lectura: number, n: number, datos: DatosDecidirResultadoLeido) {
  return pedir<LecturaDeMensajes>('POST', `${ruta(slug, id)}/${lectura}/resultados/${n}`, datos);
}
