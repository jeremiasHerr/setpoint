// Capa 4 de los resultados desde los mensajes (06-ia.md §2, decisión 119): audita lo que leyó la IA
// contra el torneo y contra el texto del mensaje. Lo que pasa todos los controles se carga solo; lo
// demás va a revisión con su motivo. Lógica pura: no llama a la IA ni toca la base.
import {
  ganadorDeLosSets,
  resultadoDelTorneoSchema,
  type DatosResultado,
  type SetCargado,
  type SistemaDeJuego,
} from '@setpoint/shared';
import type { MensajeDelChat } from './leer-chat';
import type { RespuestaMensajes, ResultadoDeLaIA } from './schema-respuesta';

export type JugadorDelTorneo = { id: number; nombre: string; apellido: string };

export type PartidoAuditable = {
  id: number;
  jugadorA: JugadorDelTorneo | null;
  jugadorB: JugadorDelTorneo | null;
  // El resultado que ya tiene, si tiene.
  estado: 'jugada' | 'walkover' | 'abandono' | 'otro';
  ganadorId: number | null;
  sets: SetCargado[];
};

export type Auditado =
  | { estado: 'seguro'; resultado: DatosResultado; motivo: null }
  | { estado: 'ya_estaba'; resultado: DatosResultado; motivo: null }
  | { estado: 'a_revisar'; resultado: DatosResultado | null; motivo: string };

// Sin tildes ni mayúsculas, y sin puntuación: "PÉREZ," es "perez".
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const contienePalabras = (texto: string, palabras: string) => palabras !== '' && ` ${texto} `.includes(` ${palabras} `);

const primerNombre = (j: JugadorDelTorneo) => normalizar(j.nombre).split(' ')[0] ?? '';

// Un nombre de pila solo identifica si nadie más del torneo se llama igual: "Martín" no dice cuál
// de los dos Martín es.
export function nombresRepetidos(jugadores: JugadorDelTorneo[]) {
  const vistos = new Map<string, number>();
  for (const j of jugadores) vistos.set(primerNombre(j), (vistos.get(primerNombre(j)) ?? 0) + 1);
  return new Set([...vistos].filter(([, n]) => n > 1).map(([nombre]) => nombre));
}

// Si el texto nombra al jugador: por su apellido, o por su nombre si no se repite en el torneo.
function nombra(texto: string, j: JugadorDelTorneo, repetidos: Set<string>) {
  const t = normalizar(texto);
  return contienePalabras(t, normalizar(j.apellido)) || (!repetidos.has(primerNombre(j)) && contienePalabras(t, primerNombre(j)));
}

// "1 4 6 10 8" → los pares de números seguidos, y cada número de dos cifras partido en dos ("46" es
// 4-6, como se escribe sin separadores). Así se busca cada set en el texto.
function paresDelTexto(texto: string) {
  const numeros = [...texto.matchAll(/\d+/g)].map((m) => m[0]);
  const pares = new Set<string>();
  for (const [i, n] of numeros.entries()) {
    if (i + 1 < numeros.length) pares.add(`${Number(n)}-${Number(numeros[i + 1])}`);
    if (n.length === 2) pares.add(`${n[0]}-${n[1]}`);
  }
  return pares;
}

// Cada set está en el mensaje, en cualquier orden: el mensaje puede venir del lado de cualquiera.
function marcadorEnElTexto(sets: { gamesA: number; gamesB: number }[], texto: string) {
  const pares = paresDelTexto(texto);
  return sets.every((s) => pares.has(`${s.gamesA}-${s.gamesB}`) || pares.has(`${s.gamesB}-${s.gamesA}`));
}

const DICE_WO = /\b(w\s?o|walk ?over|no (se )?presento|no vino|no aparecio)\b/;
const DICE_ABANDONO = /\b(abandon\w*|se retiro|retiro|me retire|lesion\w*|no pudo seguir|no pude seguir)\b/;
const DICE_GANE = /\b(gane|le gane|ganamos)\b/;
const DICE_PERDI = /\b(perdi|me gano|perdimos)\b/;

// Lo que se cargaría: el mismo formato que la carga a mano.
function comoResultado(r: ResultadoDeLaIA, partido: PartidoAuditable): DatosResultado | null {
  if (r.tipo === 'jugado') {
    if (r.sets.length === 0) return null;
    return {
      tipo: 'jugado',
      sets: r.sets.map((s) => ({ gamesA: s.gamesA, gamesB: s.gamesB, tieBreakA: null, tieBreakB: null, esSuperTieBreak: s.esSuperTieBreak })),
    };
  }
  const ganador = r.ganador === 'A' ? partido.jugadorA : r.ganador === 'B' ? partido.jugadorB : null;
  return ganador ? { tipo: r.tipo, ganadorId: ganador.id } : null;
}

const ESTADO_DEL_TIPO = { jugado: 'jugada', walkover: 'walkover', abandono: 'abandono' } as const;

// Si el partido ya tiene exactamente este resultado.
function mismoResultado(partido: PartidoAuditable, resultado: DatosResultado, ganadorId: number) {
  if (partido.estado !== ESTADO_DEL_TIPO[resultado.tipo] || partido.ganadorId !== ganadorId) return false;
  if (resultado.tipo !== 'jugado') return true;
  return (
    partido.sets.length === resultado.sets.length &&
    partido.sets.every((s, i) => s.gamesA === resultado.sets[i].gamesA && s.gamesB === resultado.sets[i].gamesB)
  );
}

export type ContextoAuditoria = {
  mensajes: Map<number, MensajeDelChat>;
  partidos: Map<number, PartidoAuditable>;
  sistema: SistemaDeJuego;
  repetidos: Set<string>;
};

// Un resultado leído. Los controles van en orden y vale el primero que falla.
export function auditarResultado(r: ResultadoDeLaIA, { mensajes, partidos, sistema, repetidos }: ContextoAuditoria): Auditado {
  const mensaje = mensajes.get(r.mensaje);
  const partido = r.partidoId === null ? undefined : partidos.get(r.partidoId);
  if (!mensaje || !partido) return { estado: 'a_revisar', resultado: null, motivo: 'No encontramos de qué partido es' };
  const { jugadorA: a, jugadorB: b } = partido;
  if (!a || !b) return { estado: 'a_revisar', resultado: null, motivo: 'El partido todavía no tiene a sus dos jugadores' };

  const resultado = comoResultado(r, partido);
  if (!resultado) return { estado: 'a_revisar', resultado: null, motivo: 'No pudimos leer el resultado' };

  const validado = resultadoDelTorneoSchema(sistema).safeParse(resultado);
  if (!validado.success) return { estado: 'a_revisar', resultado, motivo: validado.error.issues[0].message };

  const ganadorId = resultado.tipo === 'jugado' ? (ganadorDeLosSets(resultado.sets) === 'A' ? a.id : b.id) : resultado.ganadorId;
  if (resultado.tipo === 'jugado' && r.ganador !== null && ganadorDeLosSets(resultado.sets) !== r.ganador) {
    return { estado: 'a_revisar', resultado, motivo: 'El ganador no coincide con los sets' };
  }

  // Quiénes jugaron: cada uno nombrado en el mensaje, o es quien lo manda. Lo controla el código,
  // no el modelo: un resultado cargado al partido equivocado cambia dos tablas.
  const remitente = mensaje.remitente ?? '';
  const esRemitente = (j: JugadorDelTorneo) => remitente !== '' && nombra(remitente, j, repetidos);
  const remitenteEsA = esRemitente(a);
  const remitenteEsB = esRemitente(b);
  const faltan = [a, b].filter((j) => !nombra(mensaje.texto, j, repetidos) && !esRemitente(j));
  if (faltan.length === 2) return { estado: 'a_revisar', resultado, motivo: 'El mensaje no dice quiénes jugaron' };
  if (faltan.length === 1) {
    const motivo = remitente !== '' && !remitenteEsA && !remitenteEsB
      ? `No nombra a ${faltan[0].apellido}, y lo manda alguien que no jugó`
      : `El mensaje no nombra a ${faltan[0].apellido}`;
    return { estado: 'a_revisar', resultado, motivo };
  }

  // "Le gané" o "perdí": quien lo manda tiene que ser el ganador o el perdedor.
  const t = normalizar(mensaje.texto);
  const primeraPersona = DICE_GANE.test(t) ? 'gano' : DICE_PERDI.test(t) ? 'perdio' : null;
  if (primeraPersona) {
    const remitenteId = remitenteEsA && !remitenteEsB ? a.id : remitenteEsB && !remitenteEsA ? b.id : null;
    if (remitenteId === null) return { estado: 'a_revisar', resultado, motivo: 'Está en primera persona y no sabemos quién lo manda' };
    if ((remitenteId === ganadorId) !== (primeraPersona === 'gano')) {
      return { estado: 'a_revisar', resultado, motivo: 'Quien lo manda dice lo contrario de lo que leímos' };
    }
  }

  // Cada número que se carga está en el mensaje: el modelo no puede inventar un set.
  if (resultado.tipo === 'jugado' && !marcadorEnElTexto(resultado.sets, mensaje.texto)) {
    return { estado: 'a_revisar', resultado, motivo: 'El marcador no está escrito así en el mensaje' };
  }
  if (resultado.tipo === 'walkover' && !DICE_WO.test(t)) {
    return { estado: 'a_revisar', resultado, motivo: 'El mensaje no dice que fue W.O.' };
  }
  if (resultado.tipo === 'abandono' && !DICE_ABANDONO.test(t)) {
    return { estado: 'a_revisar', resultado, motivo: 'El mensaje no dice que hubo un abandono' };
  }

  if (r.confianza !== 'alta') return { estado: 'a_revisar', resultado, motivo: 'No es seguro cómo se leyó el mensaje' };

  if (mismoResultado(partido, resultado, ganadorId)) return { estado: 'ya_estaba', resultado, motivo: null };
  if (partido.estado !== 'otro') return { estado: 'a_revisar', resultado, motivo: 'El partido ya tiene otro resultado cargado' };
  return { estado: 'seguro', resultado, motivo: null };
}

// Toda la lectura: además, un mismo partido en dos mensajes va a revisión en los dos.
export function auditarLectura(respuesta: RespuestaMensajes, contexto: ContextoAuditoria): Auditado[] {
  const veces = new Map<number, number>();
  for (const r of respuesta.resultados) if (r.partidoId !== null) veces.set(r.partidoId, (veces.get(r.partidoId) ?? 0) + 1);

  return respuesta.resultados.map((r) => {
    const auditado = auditarResultado(r, contexto);
    if (r.partidoId !== null && (veces.get(r.partidoId) ?? 0) > 1 && auditado.estado === 'seguro') {
      return { estado: 'a_revisar', resultado: auditado.resultado, motivo: 'El partido aparece en dos mensajes' };
    }
    return auditado;
  });
}

// Lo que se reintenta: una respuesta que habla de mensajes o partidos que no existen. Un resultado
// dudoso no se reintenta: lo decide la organización.
export function problemasGlobales(respuesta: RespuestaMensajes, { mensajes, partidos }: ContextoAuditoria): string[] {
  const problemas: string[] = [];
  const sinMensaje = respuesta.resultados.filter((r) => !mensajes.has(r.mensaje)).map((r) => r.mensaje);
  if (sinMensaje.length > 0) problemas.push(`Estos mensajes no existen: ${sinMensaje.join(', ')}`);
  const sinPartido = respuesta.resultados.filter((r) => r.partidoId !== null && !partidos.has(r.partidoId)).map((r) => r.partidoId);
  if (sinPartido.length > 0) problemas.push(`Estos partidos no están en la lista: ${sinPartido.join(', ')}`);
  return problemas;
}
