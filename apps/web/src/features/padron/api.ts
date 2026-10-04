import type { DatosCrearJugador, DatosEditarJugador, JugadorPadron } from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function listarPadron(slug: string) {
  return pedir<JugadorPadron[]>('GET', `/api/organizaciones/${slug}/jugadores`);
}

export function crearJugador(slug: string, datos: DatosCrearJugador) {
  return pedir<JugadorPadron>('POST', `/api/organizaciones/${slug}/jugadores`, datos);
}

export function editarJugador(slug: string, id: number, datos: DatosEditarJugador) {
  return pedir<JugadorPadron>('PATCH', `/api/organizaciones/${slug}/jugadores/${id}`, datos);
}
