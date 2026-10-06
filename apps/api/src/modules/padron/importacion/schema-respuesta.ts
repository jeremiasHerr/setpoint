import { z } from 'zod';

export function armarSchemaRespuesta(etapas: string[]) {
  const etapa = z.enum(etapas as [string, ...string[]]);

  return z.object({
    esPlanillaDeJugadores: z.boolean(),
    motivo: z.string().nullable(),
    jugadores: z.array(
      z.object({
        fila: z.number(),
        nombre: z.string(),
        apellido: z.string(),
        casilleros: z.array(
          z.object({
            etapa: etapa,
            anio: z.number(),
            puntos: z.number(),
          }),
        ),
        acumulado: z.number().nullable(),
        coincideCon: z.number().nullable(),
        confianza: z.enum(['alta', 'media', 'baja']).nullable(),
      }),
    ),
  });
}

export type RespuestaImportacion = z.infer<ReturnType<typeof armarSchemaRespuesta>>;