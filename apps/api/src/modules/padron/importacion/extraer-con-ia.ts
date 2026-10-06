import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  armarSchemaRespuesta,
  type RespuestaImportacion,
} from "./schema-respuesta";
import { INSTRUCCIONES } from "./prompt";

export const MODELO = "claude-haiku-4-5-20251001";
const client = new Anthropic();

export type ResultadoExtraccion =
  | {
      ok: true;
      respuesta: RespuestaImportacion;
      crudo: string;
      tokens: { entrada: number; salida: number };
    }
  | {
      ok: false;
      error: string;
      crudo?: string;
      tokens?: { entrada: number; salida: number };
    };

export async function extraerConIA(
  mensaje: string,
  etapas: string[],
): Promise<ResultadoExtraccion> {
  const schema = armarSchemaRespuesta(etapas);
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;

  const respuesta = await client.messages.create({
    model: MODELO,
    max_tokens: 16000,
    temperature: 0,
    system: INSTRUCCIONES,
    messages: [{ role: "user", content: mensaje }],
    output_config: {
      format: { type: "json_schema", schema: jsonSchema },
    },
  });
  
  const tokens = {
    entrada: respuesta.usage.input_tokens,
    salida: respuesta.usage.output_tokens,
  };

  if (respuesta.stop_reason === "max_tokens") {
    return { ok: false, error: "La respuesta se cortó por max_tokens", tokens };
  }

  const bloque = respuesta.content.find((b) => b.type === "text");
  if (!bloque || bloque.type !== "text") {
    return { ok: false, error: "La respuesta no trajo texto", tokens };
  }

  let datos: unknown;
  try {
    datos = JSON.parse(bloque.text);
  } catch {
    return {
      ok: false,
      error: "La respuesta no es JSON válido",
      crudo: bloque.text,
      tokens,
    };
  }

  const validado = schema.safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      error: z.prettifyError(validado.error),
      crudo: bloque.text,
      tokens,
    };
  }

  return {
    ok: true,
    respuesta: validado.data,
    crudo: bloque.text,
    tokens,
  };
}
