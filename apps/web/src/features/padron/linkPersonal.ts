import type { JugadorPadron } from '@setpoint/shared';

// El link personal de inscripción que la organización manda por WhatsApp (decisión 050).

export function urlDelLink(codigo: string) {
  return `${window.location.origin}/i/${codigo}`;
}

// Nombra la edición si hay una sola abierta en su categoría; si no, es general.
export function mensajeDelLink(jugador: JugadorPadron, organizacion: string, url: string) {
  return jugador.edicionAbierta
    ? `Hola ${jugador.nombre}, inscribite al ${jugador.edicionAbierta} desde acá: ${url}`
    : `Hola ${jugador.nombre}, este es tu link para inscribirte en los torneos de ${organizacion}: ${url}`;
}

// wa.me pide el número con código de país y sin el 0 ni el 15. Un celular argentino de 10
// dígitos se completa con 549; si el número no se entiende, WhatsApp deja elegir el contacto.
function numeroDeWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, '').replace(/^0/, '');
  if (digitos.length === 10) return `549${digitos}`;
  if (digitos.startsWith('549') && digitos.length === 13) return digitos;
  return null;
}

export function urlDeWhatsApp(telefono: string, texto: string) {
  const numero = numeroDeWhatsApp(telefono);
  return `https://wa.me/${numero ?? ''}?text=${encodeURIComponent(texto)}`;
}
