import { MODELO_IMPORTACION as MODELO, pedirJson, type Tokens } from '../../../lib/ia';
import { INSTRUCCIONES } from './prompt';
import { armarSchemaRespuesta, type RespuestaImportacion } from './schema-respuesta';

export { MODELO };

export type ResultadoExtraccion =
  | { ok: true; respuesta: RespuestaImportacion; crudo: string; tokens: Tokens }
  | { ok: false; error: string; crudo?: string; tokens?: Tokens };

// Capas 2 y 3 de la importación: la salida estructurada y el safeParse de Zod (06-ia.md §1).
export async function extraerConIA(mensaje: string): Promise<ResultadoExtraccion> {
  const resultado = await pedirJson(armarSchemaRespuesta(), INSTRUCCIONES, mensaje, MODELO);
  if (!resultado.ok) return resultado;
  return { ok: true, respuesta: resultado.datos, crudo: resultado.crudo, tokens: resultado.tokens };
}
