import type { DatosConfirmarImportacion, Importacion, ResultadoConfirmacion } from '@setpoint/shared';
import { pedir } from '../../lib/api';

const base = (slug: string) => `/api/organizaciones/${slug}/importaciones`;

// Tarda ~20 s: la API lee la planilla con IA antes de responder.
export function subirPlanilla(slug: string, archivo: File, categoria: string) {
  const datos = new FormData();
  datos.append('categoria', categoria);
  datos.append('archivo', archivo);
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
