import type {
  DatosAplicarImportacion,
  DatosConfirmarImportacion,
  Importacion,
  ResultadoConfirmacion,
  ResultadoDeshacer,
} from '@setpoint/shared';
import { pedir } from '../../lib/api';

const base = (slug: string) => `/api/organizaciones/${slug}/importaciones`;

// Tarda ~20 s: la API lee la planilla con IA antes de responder.
// Hasta 10 archivos por vez (decisión 012). Sin categoría, la API toma la que diga cada planilla
// (decisión 011). En lugar de archivos, puede ir el ranking pegado como texto (decisión 140).
export function subirPlanilla(slug: string, archivos: File[], texto: string | null, categoria: string | null) {
  const datos = new FormData();
  if (categoria) datos.append('categoria', categoria);
  if (texto) datos.append('texto', texto);
  for (const archivo of archivos) datos.append('archivos', archivo);
  return pedir<Importacion>('POST', base(slug), datos);
}

export function obtenerImportacion(slug: string, id: number) {
  return pedir<Importacion>('GET', `${base(slug)}/${id}`);
}

// Crea lo que falta en el circuito e importa las filas seguras (decisión 118).
export function aplicarImportacion(slug: string, id: number, datos: DatosAplicarImportacion) {
  return pedir<Importacion>('POST', `${base(slug)}/${id}/aplicar`, datos);
}

export function deshacerImportacion(slug: string, id: number) {
  return pedir<ResultadoDeshacer>('POST', `${base(slug)}/${id}/deshacer`);
}

export function confirmarImportacion(slug: string, id: number, datos: DatosConfirmarImportacion) {
  return pedir<ResultadoConfirmacion>('POST', `${base(slug)}/${id}/confirmar`, datos);
}

export function descartarImportacion(slug: string, id: number) {
  return pedir<Importacion>('POST', `${base(slug)}/${id}/descartar`);
}
