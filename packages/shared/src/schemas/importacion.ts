import { z } from 'zod';

// Qué hace la organización con cada fila que interpretó la IA.
export const accionImportacion = z.enum(['vincular', 'crear', 'excluir']);
export type AccionImportacion = z.infer<typeof accionImportacion>;

export const decisionImportacionSchema = z
  .object({
    fila: z.number().int(),
    accion: accionImportacion,
    jugadorId: z.number().int().positive().optional(),
  })
  .refine((d) => d.accion !== 'vincular' || d.jugadorId !== undefined, {
    message: 'Elegí con qué jugador del padrón vincularlo',
    path: ['jugadorId'],
  });

export const confirmarImportacionSchema = z.object(
  { decisiones: z.array(decisionImportacionSchema) },
  { error: 'Faltan las decisiones' },
);

export type DecisionImportacion = z.infer<typeof decisionImportacionSchema>;
export type DatosConfirmarImportacion = z.infer<typeof confirmarImportacionSchema>;

// --- Lo que devuelve la API ---

export type EstadoImportacion = 'PENDIENTE' | 'PROCESADO' | 'CONFIRMADO' | 'DESCARTADO' | 'ERROR';

export type CasilleroPropuesto = { etapa: string; anio: number; puntos: number };

// Un jugador tal como lo interpretó la IA, con su número de fila en la planilla.
export type FilaExtraida = {
  fila: number;
  nombre: string;
  apellido: string;
  casilleros: CasilleroPropuesto[];
  acumulado: number | null;
  coincideCon: number | null;
  confianza: 'alta' | 'media' | 'baja' | null;
};

// Lo que ve quien revisa: además, los textos de la fila tal como están en la planilla
// ("J. Painemil"). La IA devuelve el nombre del padrón cuando lo reconoce.
export type FilaPropuesta = FilaExtraida & { enLaPlanilla: string };

export type ProblemaImportacion = { fila: number | null; detalle: string };

export type ConteosImportacion = { existentes: number; nuevos: number; dudosos: number; conProblemas: number };

export type Importacion = {
  id: number;
  archivoNombre: string;
  estado: EstadoImportacion;
  categoria: string | null;
  creadoEn: string;
  confirmadaEn: string | null;
  // Motivo, si terminó en ERROR.
  error: string | null;
  // Vacías si terminó en ERROR antes de tener una propuesta.
  propuesta: FilaPropuesta[];
  problemas: ProblemaImportacion[];
  conteos: ConteosImportacion;
};

export type ResultadoConfirmacion = {
  creados: number;
  vinculados: number;
  excluidos: number;
  movimientosCreados: number;
  movimientosSalteados: number;
};
