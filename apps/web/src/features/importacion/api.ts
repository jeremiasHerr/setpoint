import type { DatosConfirmarImportacion, Importacion, ResultadoConfirmacion } from '@setpoint/shared';
import { pedir } from '../../lib/api';

const base = (slug: string) => `/api/organizaciones/${slug}/importaciones`;

// Tarda ~20 s: la API lee la planilla con IA antes de responder.
// Hasta 10 archivos por vez (decisión 012). Sin categoría, la API toma la que diga cada planilla
// (decisión 011).
export function subirPlanilla(slug: string, archivos: File[], categoria: string | null) {
  const datos = new FormData();
  if (categoria) datos.append('categoria', categoria);
  for (const archivo of archivos) datos.append('archivos', archivo);
  return pedir<Importacion>('POST', base(slug), datos);
}

export function obtenerImportacion(slug: string, id: number) {
  return pedir<Importacion>('GET', `${base(slug)}/${id}`);
}

export function confirmarImportacion(slug: string, id: number, datos: DatosConfirmarImportacion) {
  return pedir<ResultadoConfirmacion>('POST', `${base(slug)}/${id}/confirmar`, datos);
}

export function descartarImportacion(slug: string, id: number) {
  return pedir<Importacion>('POST', `${base(slug)}/${id}/descartar`);
}
