import type { CoordinacionDelPartido, Cuadros, DatosFechaAcordadaEntrada, Tablero } from '@setpoint/shared';
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

// La fecha de un partido, para cargarla en nombre de los jugadores (F14): los días del plazo, los
// clubes y la sede.
export function obtenerCoordinacion(slug: string, id: number, partidoId: number) {
  return pedir<CoordinacionDelPartido>('GET', `${ruta(slug, id)}/partidos/${partidoId}/fecha`);
}

// Lo que carga la organización queda confirmado para los dos (decisión 064).
export function anotarFecha(slug: string, id: number, partidoId: number, datos: DatosFechaAcordadaEntrada) {
  return pedir<CoordinacionDelPartido>('PUT', `${ruta(slug, id)}/partidos/${partidoId}/fecha`, datos);
}
