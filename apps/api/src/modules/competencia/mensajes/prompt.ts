import type { SistemaDeJuego } from '@setpoint/shared';
import type { MensajeDelChat } from './leer-chat';

// Capa 1 de los resultados desde los mensajes (06-ia.md §2).
export const VERSION_PROMPT = 'mensajes-v1';

export const INSTRUCCIONES = `Leés los mensajes del grupo de WhatsApp de un torneo de tenis amateur y encontrás los resultados de los partidos.

Vas a recibir el sistema de juego del torneo, la lista de partidos (con su id y sus dos jugadores, A y B) y los mensajes, numerados, con quién los mandó cuando se sabe.

Devolvé solo los mensajes que informan el resultado de un partido. La conversación (coordinar fechas, saludos, fotos, preguntas) no se devuelve.

Para cada resultado:
- "mensaje": el número del mensaje.
- "partidoId": el id del partido de la lista entre esos dos jugadores. Los jugadores pueden aparecer por apellido, por nombre o por apodo obvio. Si el mensaje está en primera persona ("le gané a Pedro"), uno de los dos es quien lo manda. Si no podés saber de qué partido es, null.
- "tipo": "jugado" si se jugó; "walkover" si fue W.O. (uno no se presentó); "abandono" si uno se retiró en el partido.
- "ganador": "A" o "B" según la lista. En un W.O., quien estuvo para jugar; en un abandono, quien siguió.
- "sets": los sets en orden, siempre con los games de A primero y los de B después, aunque el mensaje los escriba al revés. Si quien lo manda es B y dice "perdí 4-6 3-6", A ganó 6-4 6-3. En un W.O. o un abandono, ninguno.
- "esSuperTieBreak": true en el set decisivo cuando el torneo lo juega por super tie-break ("10-8").
- "confianza": "alta" si el mensaje dice claramente el partido y el resultado; "media" o "baja" si tuviste que suponer algo.

Reglas:
- Copiá los games tal cual están en el mensaje. Nunca inventes un set que el mensaje no dice.
- Los sets pueden venir sin separadores: "46 36" es 4-6 3-6.
- "2-0" sin games no alcanza para cargar los sets: devolvelo con tipo "jugado", los sets que sí dice (ninguno, si no dice ninguno) y confianza "baja".
- Si un mensaje informa dos resultados, devolvé uno por cada partido, con el mismo número de mensaje.
- Si un mensaje corrige uno anterior, devolvé solo el corregido.`;

const descripcionDelSistema = (s: SistemaDeJuego) =>
  `Al mejor de ${s.setsPorPartido} sets de ${s.gamesPorSet} games, con tie-break a ${s.puntosTieBreak}. ` +
  (s.terceroSet === 'super_tiebreak'
    ? `El set decisivo se juega como super tie-break a ${s.puntosSuperTieBreak} puntos.`
    : 'El set decisivo se juega completo.');

export type PartidoParaLaIA = { id: number; donde: string; a: string; b: string; conResultado: boolean };

export function armarMensaje({
  torneo,
  sistema,
  partidos,
  mensajes,
}: {
  torneo: string;
  sistema: SistemaDeJuego;
  partidos: PartidoParaLaIA[];
  mensajes: MensajeDelChat[];
}) {
  const lista = partidos
    .map((p) => `id ${p.id} · ${p.donde} · A: ${p.a} · B: ${p.b}${p.conResultado ? ' · ya tiene resultado' : ''}`)
    .join('\n');
  const chat = mensajes
    .map((m) => `#${m.numero}${m.hora ? ` [${m.hora}]` : ''}${m.remitente ? ` ${m.remitente}` : ''}: ${m.texto}`)
    .join('\n');
  return `<torneo>${torneo}</torneo>\n\n<sistema>${descripcionDelSistema(sistema)}</sistema>\n\n<partidos>\n${lista}\n</partidos>\n\n<mensajes>\n${chat}\n</mensajes>`;
}
