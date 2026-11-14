import { z } from 'zod';

// Qué hace la organización con cada fila que interpretó la IA.
export const accionImportacion = z.enum(['vincular', 'crear', 'excluir']);
export type AccionImportacion = z.infer<typeof accionImportacion>;

export const decisionImportacionSchema = z
  .object({
    // La hoja de la importación: cada archivo y cada hoja tiene su lista de filas (decisión 012).
    hoja: z.number().int(),
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
    // Por id de hoja, solo las que no decían la categoría y no se eligió al subir (decisión 011).
    categorias: z.record(z.string(), z.string().trim().min(1).max(40)).optional(),
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

// Una hoja de un archivo del lote (decisión 012). Una que no se pudo leer queda en ERROR, con el
// motivo, y no frena a las demás: al confirmar, queda afuera.
export type HojaImportada = {
  id: number;
  archivoNombre: string;
  hoja: string;
  estado: EstadoImportacion;
  error: string | null;
  // La elegida al subir o la que dice la planilla. null si no la dice: se elige al revisar.
  categoria: string | null;
  // Vacías si terminó en ERROR antes de tener una propuesta.
  propuesta: FilaPropuesta[];
  problemas: ProblemaImportacion[];
  conteos: ConteosImportacion;
};

export type Importacion = {
  id: number;
  // El del archivo, o "3 archivos".
  archivoNombre: string;
  estado: EstadoImportacion;
  creadoEn: string;
  confirmadaEn: string | null;
  // Motivo, si terminó en ERROR: no se pudo leer ninguna hoja.
  error: string | null;
  hojas: HojaImportada[];
  // La suma de las hojas leídas.
  conteos: ConteosImportacion;
  // Lo que se crea en el circuito al confirmar (decisiones 011 y 098): las categorías y los torneos
  // del calendario que las planillas traen y el circuito no tiene, y si se enciende el ranking.
  crea: { categorias: string[]; etapas: string[]; ranking: boolean };
};

export type ResultadoConfirmacion = {
  creados: number;
  vinculados: number;
  excluidos: number;
  movimientosCreados: number;
  movimientosSalteados: number;
};
