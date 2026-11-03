import { z } from 'zod';

// Coordinación de partidos (F14): la fecha, la hora y la sede que acordaron los jugadores por
// WhatsApp. La app la registra, no la negocia (04-flujo-jugador §6.1). El día y la hora son los
// de Argentina; el instante lo arma la API.

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Lo que mandan la app y la web al anotar o cambiar la fecha. La sede es un club del circuito o,
// si no está en la lista (o el circuito no cargó clubes), lo que escriban. En una instancia con
// sede designada se ignora: la pone la organización.
export const fechaAcordadaSchema = z.object({
  dia: z.string({ error: 'Elegí el día' }).regex(DIA, 'Elegí el día'),
  hora: z.string({ error: 'Elegí la hora' }).regex(HORA, 'Elegí la hora'),
  clubId: z.number().int().positive().nullable().default(null),
  sedeTexto: z
    .string()
    .trim()
    .max(80, 'Como máximo 80 caracteres')
    .nullable()
    .default(null)
    .transform((texto) => texto || null),
});

export type DatosFechaAcordadaEntrada = z.input<typeof fechaAcordadaSchema>;
export type DatosFechaAcordada = z.output<typeof fechaAcordadaSchema>;

export type PersonaDelPartido = { nombre: string; apellido: string };

// Qué hace "anotar" sobre el partido, según cómo está:
//   anotar: nadie cargó fecha todavía.
//   cambiar: hay una fecha sin confirmar; cambiarla no cuenta como reprogramación.
//   reprogramar: hay una fecha confirmada; gasta una de las reprogramaciones del torneo.
export type AccionDeFecha = 'anotar' | 'cambiar' | 'reprogramar';

// Por qué el jugador no puede anotar la fecha desde la app. Con cualquiera de estos, la
// organización la puede cargar igual.
export type BloqueoDeFecha =
  | 'PARTIDO_TERMINADO'
  | 'PLAZO_VENCIDO'
  | 'SIN_REPROGRAMACIONES'
  | 'SIN_ANTELACION'
  | 'SIN_RIVAL';

// Quién cargó la fecha que está ahora, desde el lado de quien pregunta.
export type QuienAnoto = 'yo' | 'rival' | 'organizacion';

export type SedeDelPartido =
  // En zonas eligen ellos: entre los clubes del circuito o escribiendo la sede.
  | { modo: 'libre'; clubes: { id: number; nombre: string }[] }
  // En eliminatorias la pone la organización. null mientras no la haya elegido.
  | { modo: 'designada'; nombre: string | null };

export type FechaDelPartido = {
  dia: string; // 'AAAA-MM-DD'
  hora: string; // 'HH:MM'
  clubId: number | null;
  sedeTexto: string | null;
  // "Club Alta Barda", o lo que hayan escrito.
  sede: string | null;
};

// Lo que necesita la pantalla Anotar la fecha (docs/pantallas/jugador/anotar-fecha.html), y la
// web de la organización para cargarla en nombre de los jugadores.
export type CoordinacionDelPartido = {
  partidoId: number;
  // "zona C", "campeonato · semifinales".
  instancia: string;
  jugadores: [PersonaDelPartido | null, PersonaDelPartido | null];
  // El rival de quien pregunta. null para la organización.
  rival: PersonaDelPartido | null;
  estado: string;
  // El último día para jugarlo, incluido. null si el partido no tiene plazo.
  ultimoDia: string | null;
  // Los días que se pueden elegir: de hoy al último del plazo.
  dias: string[];
  sede: SedeDelPartido;
  actual: FechaDelPartido | null;
  anotadaPor: QuienAnoto | null;
  // null si no puede: el motivo está en `bloqueo`.
  accion: AccionDeFecha | null;
  bloqueo: BloqueoDeFecha | null;
  reprogramacionesRestantes: number;
  horasAntelacionReprogramar: number;
};
