import type { CoordinacionDelPartido, Cuadros, DatosExtenderPlazo, DatosFechaAcordadaEntrada, RecordatorioEnviado, Tablero } from '@setpoint/shared';
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

// Confirma el resultado que cargó un jugador y el rival no confirmó: cuenta como si lo hubiera
// cargado la organización (decisión 127).
export function confirmarResultadoPropuesto(slug: string, id: number, partidoId: number) {
  return pedir('POST', `${ruta(slug, id)}/partidos/${partidoId}/resultado-propuesto/confirmacion`);
}

// Corre la fecha límite de un partido pendiente (decisión 135). Devuelve el tablero como quedó.
export function extenderPlazo(slug: string, id: number, partidoId: number, datos: DatosExtenderPlazo) {
  return pedir<Tablero>('PATCH', `${ruta(slug, id)}/tablero/partidos/${partidoId}/plazo`, datos);
}

// Les recuerda el partido a los dos: aviso a quien tiene la app, email a quien tiene cuenta (decisión 135).
export function recordarPartido(slug: string, id: number, partidoId: number) {
  return pedir<RecordatorioEnviado>('POST', `${ruta(slug, id)}/tablero/partidos/${partidoId}/recordatorio`);
}
