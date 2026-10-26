import { z } from 'zod';

// Cómo encuentra su perfil quien se inscribe (04-flujo-jugador §5.6, decisión 051).

// Un perfil del padrón en la búsqueda: solo nombre y apellido, nunca datos de contacto.
export type PerfilEncontrado = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  // Ya tiene cuenta: se muestra marcado, y elegirlo lleva al aviso de perfil vinculado.
  vinculado: boolean;
};

export type BusquedaEnElPadron = { perfiles: PerfilEncontrado[] };

// Lo que necesita la pantalla de identificación después del código, con la sesión de la persona.
export type SituacionEnElTorneo = {
  // Su perfil en esta organización, si ya tiene.
  perfil: { jugadorId: number; nombre: string; apellido: string; categoria: string | null } | null;
  // Su inscripción en este torneo: pagada, o una reserva que todavía no venció.
  // En los torneos con aprobación, también la solicitud o la aprobada que falta pagar (decisión 054).
  inscripcion: { id: number; estado: 'pagada' | 'reservando' | 'solicitada' | 'aprobada'; reservaVence: string | null } | null;
  // Si ya juega en otro circuito y es nuevo en este: los perfiles con su apellido en la categoría,
  // para el "¿Sos…?". Vacío si no hay o si ya tiene perfil acá.
  propuestas: PerfilEncontrado[];
};

export const reservarSchema = z.object(
  {
    jugadorId: z.number({ error: 'Falta el perfil' }).int().positive(),
    // Cómo lo eligió, si el perfil todavía no era suyo. Queda en el aviso de vinculaciones nuevas.
    vinculaPor: z.enum(['busqueda', 'propuesta', 'link_personal']).optional(),
    // Con el link personal, el código del link: prueba que el perfil lo eligió la organización.
    codigoLink: z.string().max(64).optional(),
  },
  { error: 'Falta el perfil' },
);

export type DatosReservar = z.infer<typeof reservarSchema>;

export type Reserva = {
  inscripcionId: number;
  // Hasta cuándo se guarda el lugar, en ISO.
  reservaVence: string;
};

// Quien no está en el padrón, en un torneo con aprobación o abierto (decisión 054): deja su nombre y
// apellido. Con aprobación queda como solicitud; abierto, reserva el lugar y sigue al pago.
export const inscribirComoNuevoSchema = z.object(
  {
    nombre: z.string({ error: 'Falta el nombre' }).trim().min(1, 'Falta el nombre').max(60),
    apellido: z.string({ error: 'Falta el apellido' }).trim().min(1, 'Falta el apellido').max(60),
  },
  { error: 'Faltan el nombre y el apellido' },
);

export type DatosInscribirComoNuevo = z.infer<typeof inscribirComoNuevoSchema>;

export type InscripcionComoNuevo = {
  inscripcionId: number;
  estado: 'solicitada' | 'reservando';
  reservaVence: string | null;
};
