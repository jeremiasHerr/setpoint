import type { Cuadros, Tablero } from '@setpoint/shared';
import { pedir } from '../../lib/api';

// El id es el de un torneo (una categoría): cada categoría tiene su tablero.
const ruta = (slug: string, id: number) => `/api/organizaciones/${slug}/torneos/${id}`;

export function obtenerTablero(slug: string, id: number) {
  return pedir<Tablero>('GET', `${ruta(slug, id)}/tablero`);
}

// Cierra las zonas y arma los cuadros con las posiciones finales. No se deshace (decisión 026).
export function cerrarZonas(slug: string, id: number) {
  return pedir<Cuadros>('POST', `${ruta(slug, id)}/cuadros`);
}
