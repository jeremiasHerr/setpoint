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
  {
    decisiones: z.array(decisionImportacionSchema),
    // Solo si la planilla no decía la categoría y no se eligió al subir (decisión 011).
    categoria: z.string().trim().min(1).max(40).optional(),
  },
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
  // La elegida al subir o la que dice la planilla. null si no la dice: se elige al revisar.
  categoria: string | null;
  // Lo que se crea en el circuito al confirmar (decisiones 011 y 098): la categoría y los torneos
  // del calendario que la planilla trae y el circuito no tiene, y si se enciende el ranking.
  crea: { categoria: string | null; etapas: string[]; ranking: boolean };
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
