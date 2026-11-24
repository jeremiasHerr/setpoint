import type { TorneoPublico } from '@setpoint/shared';
import { diaLargo, importe, lugaresLibres } from './convocatoria';

// Lo que muestra WhatsApp al pegar el link del torneo (decisión 144). No la usa la página: la arma la
// función de Cloudflare de functions/inscripcion, que la pone en el HTML antes de que llegue.

export type VistaPrevia = { titulo: string; descripcion: string };

// "General" es la categoría con la que arranca un torneo suelto (decisión 089): no suma nada al título.
const SIN_CATEGORIA = 'General';

export function vistaPreviaDelTorneo(torneo: TorneoPublico): VistaPrevia {
  const titulo = torneo.categoria === SIN_CATEGORIA ? torneo.nombre : `${torneo.nombre} · ${torneo.categoria}`;

  const partes: string[] = [];
  if (torneo.inscripcion === 'abierta') {
    partes.push(torneo.cierreInscripcion ? `Inscripción abierta hasta el ${diaLargo(torneo.cierreInscripcion)}.` : 'Inscripción abierta.');
    partes.push(torneo.precio > 0 ? `Cuesta ${importe(torneo.precio)}.` : 'Es gratis.');
    if (lugaresLibres(torneo) === 0) partes.push(torneo.listaDeEspera ? 'El cupo está lleno: queda la lista de espera.' : 'El cupo está lleno.');
  } else {
    partes.push('La inscripción ya cerró.');
  }
  partes.push(`Organiza ${torneo.organizacion.nombre}.`);

  return { titulo, descripcion: partes.join(' ') };
}
