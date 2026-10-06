// Orquesta las capas de la importación: leer, extraer con IA, auditar y, si hace falta,
// reintentar una vez con los problemas como feedback. No toca la base.
import { auditar, type Auditoria } from './auditar';
import { extraerConIA, MODELO, type ResultadoExtraccion } from './extraer-con-ia';
import { leerPlanilla } from './leer-planilla';
import { armarMensaje, VERSION_PROMPT } from './prompt';
import type { RespuestaImportacion } from './schema-respuesta';

type JugadorPadron = { id: number; nombre: string; apellido: string };
type Tokens = { entrada: number; salida: number };

export type ContextoImportacion = { padron: JugadorPadron[]; etapas: string[]; hoy: Date };

type Comun = {
  crudos: string[];
  modelo: string;
  versionPrompt: string;
  tokens: Tokens;
  intentos: number;
};

export type ResultadoImportacion =
  | ({ ok: true; respuesta: RespuestaImportacion; auditoria: Auditoria } & Comun)
  | ({ ok: false; error: string; auditoria?: Auditoria } & Comun);

const MAXIMO_INTENTOS = 2;

// Un error de red o de la API no rompe la importación: es un intento fallido más.
async function intentar(mensaje: string, etapas: string[]): Promise<ResultadoExtraccion> {
  try {
    return await extraerConIA(mensaje, etapas);
  } catch (err) {
    return { ok: false, error: `Falló la llamada a la IA: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function procesarPlanilla(
  archivo: Buffer,
  { padron, etapas, hoy }: ContextoImportacion,
): Promise<ResultadoImportacion> {
  const filas = leerPlanilla(archivo);
  const mensaje = armarMensaje(filas, padron, etapas, hoy);
  const idsPadron = padron.map((j) => j.id);

  const comun: Comun = { crudos: [], modelo: MODELO, versionPrompt: VERSION_PROMPT, tokens: { entrada: 0, salida: 0 }, intentos: 0 };
  let feedback: string[] = [];
  let auditoria: Auditoria | undefined;

  while (comun.intentos < MAXIMO_INTENTOS) {
    const conFeedback = feedback.length === 0
      ? mensaje
      : `${mensaje}\n\nTu respuesta anterior tuvo estos problemas:\n${feedback.map((p) => `- ${p}`).join('\n')}`;

    const resultado = await intentar(conFeedback, etapas);
    comun.intentos++;
    if (resultado.crudo !== undefined) comun.crudos.push(resultado.crudo);
    if (resultado.tokens) {
      comun.tokens.entrada += resultado.tokens.entrada;
      comun.tokens.salida += resultado.tokens.salida;
    }

    if (!resultado.ok) {
      feedback = [resultado.error];
      auditoria = undefined;
      continue;
    }

    // Los problemas por fila no se reintentan: los resuelve la persona en la revisión.
    auditoria = auditar(resultado.respuesta, filas, idsPadron);
    if (auditoria.globales.length === 0) {
      return { ok: true, respuesta: resultado.respuesta, auditoria, ...comun };
    }
    feedback = auditoria.globales.map((p) => p.detalle);
  }

  return { ok: false, error: feedback.join('. '), auditoria, ...comun };
}
