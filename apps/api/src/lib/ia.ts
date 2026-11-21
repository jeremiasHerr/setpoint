import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// La llamada a un modelo con salida estructurada, para las dos funcionalidades de IA: la importación
// de la planilla (F03) y los resultados desde los mensajes (F19). Solo desde la API, nunca desde un
// cliente. La forma la garantiza el JSON Schema que se le pasa al modelo, y además se verifica con
// Zod de nuestro lado: lo que no pasa no se usa.

export const MODELO = 'claude-haiku-4-5-20251001';
const client = new Anthropic();

export type Tokens = { entrada: number; salida: number };

export type RespuestaIA<T> =
  | { ok: true; datos: T; crudo: string; tokens: Tokens }
  | { ok: false; error: string; crudo?: string; tokens?: Tokens };

export async function pedirJson<T>(
  schema: z.ZodType<T>,
  instrucciones: string,
  mensaje: string,
  maxTokens = 16000,
): Promise<RespuestaIA<T>> {
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;

  const respuesta = await client.messages.create({
    model: MODELO,
    max_tokens: maxTokens,
    temperature: 0,
    system: instrucciones,
    messages: [{ role: 'user', content: mensaje }],
    output_config: { format: { type: 'json_schema', schema: jsonSchema } },
  });

  const tokens = { entrada: respuesta.usage.input_tokens, salida: respuesta.usage.output_tokens };
  if (respuesta.stop_reason === 'max_tokens') return { ok: false, error: 'La respuesta se cortó por max_tokens', tokens };

  const bloque = respuesta.content.find((b) => b.type === 'text');
  if (!bloque || bloque.type !== 'text') return { ok: false, error: 'La respuesta no trajo texto', tokens };

  let datos: unknown;
  try {
    datos = JSON.parse(bloque.text);
  } catch {
    return { ok: false, error: 'La respuesta no es JSON válido', crudo: bloque.text, tokens };
  }

  const validado = schema.safeParse(datos);
  if (!validado.success) return { ok: false, error: z.prettifyError(validado.error), crudo: bloque.text, tokens };
  return { ok: true, datos: validado.data, crudo: bloque.text, tokens };
}

// Un error de red o de la API no rompe nada: es un intento fallido más.
export async function intentarJson<T>(
  schema: z.ZodType<T>,
  instrucciones: string,
  mensaje: string,
  maxTokens?: number,
): Promise<RespuestaIA<T>> {
  try {
    return await pedirJson(schema, instrucciones, mensaje, maxTokens);
  } catch (err) {
    return { ok: false, error: `Falló la llamada a la IA: ${err instanceof Error ? err.message : String(err)}` };
  }
}
