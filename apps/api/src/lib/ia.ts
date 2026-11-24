import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// La llamada a un modelo con salida estructurada, para las dos funcionalidades de IA: la importación
// de la planilla (F03) y los resultados desde los mensajes (F19). Solo desde la API, nunca desde un
// cliente. La forma la garantiza el JSON Schema que se le pasa al modelo, y además se verifica con
// Zod de nuestro lado: lo que no pasa no se usa.

// Cada funcionalidad tiene su modelo (decisión 141). La importación copia números de una tabla, y
// Haiku da 991 / 991 en su eval. Los mensajes piden entender quién le ganó a quién en texto libre, y
// con Haiku el eval daba 3 / 7: Sonnet da 7 / 7.
export const MODELO_IMPORTACION = 'claude-haiku-4-5-20251001';
export const MODELO_MENSAJES = 'claude-sonnet-5-5';
export type Modelo = typeof MODELO_IMPORTACION | typeof MODELO_MENSAJES;

// US$ por millón de tokens, para el tope de gasto (decisión 121) y los evals.
export const PRECIOS: Record<Modelo, Tokens> = {
  [MODELO_IMPORTACION]: { entrada: 1, salida: 5 },
  [MODELO_MENSAJES]: { entrada: 2, salida: 10 },
};

export const costoUsd = (tokens: Tokens, modelo: Modelo) =>
  (tokens.entrada * PRECIOS[modelo].entrada + tokens.salida * PRECIOS[modelo].salida) / 1_000_000;

const client = new Anthropic();

export type Tokens = { entrada: number; salida: number };

export type RespuestaIA<T> =
  | { ok: true; datos: T; crudo: string; tokens: Tokens }
  | { ok: false; error: string; crudo?: string; tokens?: Tokens };

// Haiku 4.5 va con temperature 0, para que la misma planilla se lea igual. Sonnet 5.5 no la acepta,
// y si un clasificador de seguridad rechaza el pedido, la API lo reintenta sola con otro modelo.
function crear(modelo: Modelo, instrucciones: string, mensaje: string, maxTokens: number, jsonSchema: Record<string, unknown>) {
  const comun = {
    max_tokens: maxTokens,
    system: instrucciones,
    messages: [{ role: 'user' as const, content: mensaje }],
    output_config: { format: { type: 'json_schema' as const, schema: jsonSchema } },
  };
  if (modelo === MODELO_IMPORTACION) return client.messages.create({ ...comun, model: modelo, temperature: 0 });
  return client.beta.messages.create({ ...comun, model: modelo, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
}

export async function pedirJson<T>(
  schema: z.ZodType<T>,
  instrucciones: string,
  mensaje: string,
  modelo: Modelo,
  maxTokens = 16000,
): Promise<RespuestaIA<T>> {
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;

  const respuesta = await crear(modelo, instrucciones, mensaje, maxTokens, jsonSchema);

  const tokens = { entrada: respuesta.usage.input_tokens, salida: respuesta.usage.output_tokens };
  if (respuesta.stop_reason === 'max_tokens') return { ok: false, error: 'La respuesta se cortó por max_tokens', tokens };
  if (respuesta.stop_reason === 'refusal') return { ok: false, error: 'El modelo no respondió el pedido', tokens };

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
  modelo: Modelo,
  maxTokens?: number,
): Promise<RespuestaIA<T>> {
  try {
    return await pedirJson(schema, instrucciones, mensaje, modelo, maxTokens);
  } catch (err) {
    return { ok: false, error: `Falló la llamada a la IA: ${err instanceof Error ? err.message : String(err)}` };
  }
}
