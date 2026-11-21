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

// Lo que se elige al revisar: la categoría de las hojas que no la decían y no se eligió al subir
// (decisión 011), por id de hoja.
const categoriasElegidas = z.record(z.string(), z.string().trim().min(1).max(40)).optional();

// Confirma lo que se crea en el circuito y aplica las filas seguras (decisión 118).
export const aplicarImportacionSchema = z.object({ categorias: categoriasElegidas });

// Las decisiones van solo para las filas a revisar: las seguras se aplican sin preguntar (decisión 118).
export const confirmarImportacionSchema = z.object(
  {
    decisiones: z.array(decisionImportacionSchema),
    categorias: categoriasElegidas,
  },
  { error: 'Faltan las decisiones' },
);

export type DecisionImportacion = z.infer<typeof decisionImportacionSchema>;
export type DatosConfirmarImportacion = z.infer<typeof confirmarImportacionSchema>;
export type DatosAplicarImportacion = z.infer<typeof aplicarImportacionSchema>;

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
// Con la importación por excepción (decisión 118), además: por qué va a revisión (null si se importa
// sola) y si ya se aplicó.
export type FilaPropuesta = FilaExtraida & { enLaPlanilla: string; revisar: string | null; aplicada: boolean };

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
  // Cuándo se aplicaron las filas seguras (decisión 118). Con estado PROCESADO, quedan filas por revisar.
  aplicadaEn: string | null;
  // Cuándo se deshizo. Queda DESCARTADO.
  deshechaEn: string | null;
  confirmadaEn: string | null;
  // Motivo, si terminó en ERROR: no se pudo leer ninguna hoja.
  error: string | null;
  hojas: HojaImportada[];
  // La suma de las hojas leídas.
  conteos: ConteosImportacion;
  // Por excepción (decisión 118): las filas que se importan solas y las que van a revisión.
  seguras: number;
  aRevisar: number;
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

// Deshacer borra los movimientos de la importación y los jugadores que creó, salvo los que ya tienen
// otra actividad (decisión 118).
export type ResultadoDeshacer = { movimientosBorrados: number; jugadoresBorrados: number; jugadoresQueQuedan: number };
