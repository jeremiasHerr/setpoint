import { z } from 'zod';

// Las vinculaciones que el sistema no resuelve solo (04-flujo-jugador §5.9, decisión 051): un
// posible homónimo o un perfil reclamado por otra cuenta. La organización decide sobre su padrón,
// nunca sobre el email de nadie.

export type MotivoDeRevision = 'homonimo' | 'reclamo';
export type ComoSeVinculo = 'link_personal' | 'busqueda' | 'propuesta' | 'organizacion';

// La lista de "Para revisar", y cuántas vinculaciones se guardaron solas.
export type Revisiones = {
  casos: { jugadorId: number; nombre: string; apellido: string; categoria: string | null; motivo: MotivoDeRevision }[];
  vinculadosSolos: number;
};

// Un perfil con lo que lo distingue de otro: partidos, puntos, antigüedad y teléfono.
export type PerfilEnRevision = {
  jugadorId: number;
  nombre: string;
  apellido: string;
  categoria: string | null;
  desde: string;
  partidos: number;
  puntos: number;
  puesto: number | null;
  telefono: string;
  // El email de la cuenta vinculada, si tiene.
  cuenta: string | null;
};

export type InscripcionEnRevision = {
  id: number;
  torneo: string;
  estado: 'pagada' | 'reservando';
  monto: number;
  pagadoEn: string | null;
};

export type CasoHomonimo = {
  motivo: 'homonimo';
  jugadorId: number;
  cuenta: string;
  vinculadoPor: ComoSeVinculo | null;
  // La inscripción con la que se vinculó.
  inscripcion: InscripcionEnRevision | null;
  elegido: PerfilEnRevision;
  otros: PerfilEnRevision[];
};

export type CasoReclamo = {
  motivo: 'reclamo';
  jugadorId: number;
  perfil: PerfilEnRevision;
  titular: { email: string; vinculadoEn: string | null; vinculadoPor: ComoSeVinculo | null; inscripciones: InscripcionEnRevision[] };
  // otroPerfil: si quien reclama ya tiene otro perfil en el circuito, no se le puede pasar este.
  reclamante: { email: string; reclamadoEn: string | null; otroPerfil: string | null };
};

export type CasoDeRevision = CasoHomonimo | CasoReclamo;

export const resolverRevisionSchema = z.discriminatedUnion(
  'accion',
  [
    // Posible homónimo.
    z.object({ accion: z.literal('confirmar') }),
    z.object({ accion: z.literal('pasar_inscripcion'), aJugadorId: z.number().int().positive() }),
    z.object({ accion: z.literal('alta_nuevo') }),
    // Perfil reclamado. Al pasarle el perfil, las inscripciones de la cuenta que lo tenía quedan en
    // el perfil o se dan de baja.
    z.object({ accion: z.literal('dejar') }),
    z.object({ accion: z.literal('pasar_perfil'), inscripciones: z.enum(['quedan', 'baja']) }),
    z.object({ accion: z.literal('desvincular') }),
  ],
  { error: 'Falta qué hacer' },
);

export type ResolverRevision = z.infer<typeof resolverRevisionSchema>;

// Quien dice que un perfil vinculado a otra cuenta es suyo (el botón "Avisarle a la organización").
export const reclamarPerfilSchema = z.object(
  { jugadorId: z.number({ error: 'Falta el perfil' }).int().positive() },
  { error: 'Falta el perfil' },
);

export type DatosReclamarPerfil = z.infer<typeof reclamarPerfilSchema>;
