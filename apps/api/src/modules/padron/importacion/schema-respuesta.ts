import { z } from 'zod';

// La forma de la respuesta de la IA (capa 2). Las etapas son texto: la planilla puede traer torneos
// del calendario que el circuito todavía no tiene, y se crean al confirmar (decisión 011). Que cada
// casillero use una etapa de la lista lo controla la auditoría (capa 4).
export function armarSchemaRespuesta() {
  return z.object({
    esPlanillaDeJugadores: z.boolean(),
    motivo: z.string().nullable(),
    // La categoría que dice la planilla: el nombre de la hoja, un título o el nombre del archivo.
    // null si no la dice.
    categoria: z.string().nullable(),
    // Los torneos del calendario de los encabezados, en el orden de las columnas y sin el año.
    etapas: z.array(z.string()),
    jugadores: z.array(
      z.object({
        fila: z.number(),
        nombre: z.string(),
        apellido: z.string(),
        casilleros: z.array(
          z.object({
            etapa: z.string(),
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
