import { z } from 'zod';
import type { DatosResultado, PartidoDeLaLista } from './resultado';

// F19 — Resultados desde los mensajes del grupo (06-ia.md §2, decisión 119). La organización pega
// los mensajes como los copia WhatsApp; la IA lee los resultados, el código los audita contra el
// torneo, lo que pasa todos los controles se carga solo y lo demás espera a la organización.

// Unos 200 mensajes: lo que llega al grupo en una semana de torneo.
export const MAXIMO_TEXTO_MENSAJES = 20_000;

export const leerMensajesSchema = z.object({
  texto: z
    .string({ error: 'Pegá los mensajes del grupo' })
    .trim()
    .min(1, 'Pegá los mensajes del grupo')
    .max(MAXIMO_TEXTO_MENSAJES, 'Es demasiado texto: pegá los mensajes de unos días'),
});

// Lo que hace la organización con un resultado que no se cargó solo.
export const decidirResultadoLeidoSchema = z.object({ accion: z.enum(['cargar', 'descartar']) });

export type DatosLeerMensajes = z.infer<typeof leerMensajesSchema>;
export type DatosDecidirResultadoLeido = z.infer<typeof decidirResultadoLeidoSchema>;

// cargado: pasó los controles y se guardó solo, o lo cargó la organización.
// ya_estaba: el partido ya tenía este mismo resultado.
// a_revisar: no pasó algún control; espera a la organización, con su motivo.
// descartado: la organización decidió no cargarlo.
export type EstadoResultadoLeido = 'cargado' | 'ya_estaba' | 'a_revisar' | 'descartado';

export type ResultadoLeido = {
  // El orden del resultado en la lectura: con esto se decide sobre él.
  n: number;
  // El mensaje del que salió, como está en el chat.
  mensaje: number;
  hora: string | null;
  remitente: string | null;
  texto: string;
  // El partido que entendió la IA. null si no lo pudo ubicar.
  partido: PartidoDeLaLista | null;
  // Lo que se carga: el mismo formato que la carga a mano. null si no se pudo leer.
  resultado: DatosResultado | null;
  estado: EstadoResultadoLeido;
  // Por qué va a revisión, o por qué no se pudo cargar. null si se cargó solo.
  motivo: string | null;
  // Si lo cargó la organización desde la revisión, en lugar de cargarse solo.
  cargadoAMano: boolean;
};

export type LecturaDeMensajes = {
  id: number;
  torneoId: number;
  // "Primavera 2026 · Tercera"
  nombre: string;
  // Cómo llama la organización a su cuadro consuelo (07 §1.2).
  nombreCuadroConsuelo: string;
  estado: 'PROCESADO' | 'ERROR';
  // El motivo, si terminó en ERROR: no se pudo leer nada.
  error: string | null;
  // Cuántos mensajes tenía el texto, sean o no resultados.
  mensajes: number;
  resultados: ResultadoLeido[];
  creadoEn: string;
};
