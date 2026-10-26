import type { EstadoTorneo } from './torneo';

// Inscripciones de un torneo, es decir, de una categoría (F13, versión mínima). Por ahora solo
// se listan las que ocupan un lugar del cupo: las pagadas y las reservas sin pagar.

export type MedioPago = 'mercadopago' | 'efectivo' | 'transferencia' | 'otro';

export type InscripcionDelTorneo = {
  id: number;
  nombre: string;
  apellido: string;
  // "reservando" es una inscripción con el pago pendiente: ocupa el lugar mientras no vence.
  estado: 'pagada' | 'reservando';
  // null si todavía no hay pago.
  medio: MedioPago | null;
  // Día en que se inscribió, 'AAAA-MM-DD'.
  fecha: string;
  // Cuándo vence la reserva, en ISO. null si está pagada.
  reservaVence: string | null;
};

export type InscripcionesDelTorneo = {
  torneoId: number;
  // El de la convocatoria, que es el que va en la URL de Nuevo torneo (decisión 003).
  convocatoriaId: number;
  // "Primavera 2026 · Tercera"
  nombre: string;
  estado: EstadoTorneo;
  // Con aprobación, la pantalla muestra las solicitudes aunque todavía no haya ninguna.
  modoInscripcion: 'cerrada' | 'con_aprobacion' | 'abierta';
  sorteoConfirmado: boolean;
  cierreInscripcion: string | null;
  cupo: number;
  cantidadGrupos: number;
  // Si las pagadas alcanzan para las zonas del formato. Si no, no se puede cerrar (decisión 025).
  alcanzanParaLasZonas: boolean;
  // De la más reciente a la más vieja.
  inscripciones: InscripcionDelTorneo[];
  // Torneos con aprobación: quienes no están en el padrón y piden entrar (decisión 054). La
  // aprobada espera que la persona abra el link y pague; ninguna ocupa lugar.
  solicitudes: SolicitudDelTorneo[];
};

export type SolicitudDelTorneo = {
  id: number;
  nombre: string;
  apellido: string;
  // El email verificado: la organización ve quién pide entrar.
  email: string;
  estado: 'solicitada' | 'aprobada';
  // Día en que la pidió, 'AAAA-MM-DD'.
  fecha: string;
};
