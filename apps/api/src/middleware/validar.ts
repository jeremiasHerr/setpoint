import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

// Valida req.body y lo reemplaza por el resultado parseado (con trim, lowercase, etc.).
export function validar(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const campos: Record<string, string> = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path.join('.') || '_';
        campos[campo] ??= issue.message;
      }
      res.status(400).json({ error: 'DATOS_INVALIDOS', campos });
      return;
    }
    req.body = resultado.data;
    next();
  };
}
