import type { CierreDelTorneo } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// El id es el de un torneo (una categoría): cada categoría se cierra por separado.
const ruta = (slug: string, id: number) => `/api/organizaciones/${slug}/torneos/${id}/cierre`;

// Qué va a pasar al cerrar, o qué pasó si ya se cerró.
export function obtenerCierre(slug: string, id: number) {
  return pedir<CierreDelTorneo>('GET', ruta(slug, id));
}

export function cerrarTorneo(slug: string, id: number) {
  return pedir<CierreDelTorneo>('POST', ruta(slug, id));
}
