import { z } from 'zod';
import type { EstadoTorneo } from './torneo';

// Inscripciones de un torneo, es decir, de una categoría (F13): quiénes ocupan el cupo, la lista de
// espera, las bajas y la conciliación del torneo. docs/pantallas/organizador/inscripciones.html

export type MedioPago = 'mercadopago' | 'efectivo' | 'transferencia' | 'otro';

// Las que ocupan un lugar del cupo: las pagadas y las reservas sin pagar.
export type InscripcionDelTorneo = {
  id: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // "reservando" es una inscripción con el pago pendiente: ocupa el lugar mientras no vence.
  estado: 'pagada' | 'reservando';
  // null si todavía no hay pago.
  medio: MedioPago | null;
  // Lo que pagó, que con un pago a mano puede no ser el precio. null si todavía no pagó.
  monto: number | null;
  // Día en que se inscribió, 'AAAA-MM-DD'.
  fecha: string;
  // Cuándo vence la reserva, en ISO. null si está pagada.
  reservaVence: string | null;
  // Reserva el lugar que se liberó porque era el primero de la lista de espera (decisión 076).
  deLaListaDeEspera: boolean;
};

// Quienes esperan un lugar, en el orden en que lo van a recibir.
export type EnListaDeEspera = {
  id: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // 1 es el próximo en recibir un lugar.
  posicion: number;
  // Día en que se anotó, 'AAAA-MM-DD'.
  fecha: string;
};

// Qué pasa con la plata de quien se dio de baja (decisión 075). El sistema solo lo anota: la
// devolución la hace la organización, por fuera.
export type DevolucionDeLaBaja = 'pendiente' | 'hecha' | 'no_corresponde';

export type BajaDelTorneo = {
  id: number;
  jugadorId: number;
  nombre: string;
  apellido: string;
  // Día de la baja, 'AAAA-MM-DD'.
  fecha: string;
  medio: MedioPago | null;
  monto: number;
  devolucion: DevolucionDeLaBaja;
};

// Se calcula al consultar, con los pagos del torneo (decisión 078).
export type ConciliacionDelTorneo = {
  // Lo cobrado por MercadoPago, también lo que después hay que devolver: ya se cobró.
  mercadoPago: number;
  pagosMercadoPago: number;
  // La comisión de la plataforma, solo sobre lo cobrado por MercadoPago.
  porcentajeComision: number;
  comision: number;
  // Lo que la plataforma le transfiere a la organización, por fuera del sistema (05-pagos §2).
  teCorresponde: number;
  // Lo que la organización cobró en mano o por transferencia: ya lo tiene.
  porFuera: number;
  pagosPorFuera: number;
  // Las devoluciones que todavía no hizo.
  aDevolver: number;
  devolucionesPendientes: number;
};

export type InscripcionesDelTorneo = {
  torneoId: number;
  // El de la convocatoria, que es el que va en la URL de Nuevo torneo (decisión 003).
  convocatoriaId: number;
  // "Primavera 2026 · Tercera"
  nombre: string;
  // "Tercera": para buscar en el padrón a quien se inscribe a mano.
  categoria: string;
  // Ajeno al circuito: a mano se busca en todo el padrón (decisión 089).
  suelto: boolean;
  estado: EstadoTorneo;
  // Con aprobación, la pantalla muestra las solicitudes aunque todavía no haya ninguna.
  modoInscripcion: 'cerrada' | 'con_aprobacion' | 'abierta';
  sorteoConfirmado: boolean;
  cierreInscripcion: string | null;
  cupo: number;
  precio: number;
  cantidadGrupos: number;
  // Si las pagadas alcanzan para las zonas del formato. Si no, no se puede cerrar (decisión 025).
  alcanzanParaLasZonas: boolean;
  // Lugares del cupo que nadie ocupa. Con gente en la lista de espera, casi siempre 0: el lugar que
  // se libera pasa al primero.
  libres: number;
  // Dar de baja e inscribir a mano: hasta que se confirma el sorteo (decisión 077).
  sePuedeModificar: boolean;
  tieneListaEspera: boolean;
  horasReservaListaEspera: number;
  // Las que ocupan lugar, de la más reciente a la más vieja.
  inscripciones: InscripcionDelTorneo[];
  listaDeEspera: EnListaDeEspera[];
  // De la más reciente a la más vieja.
  bajas: BajaDelTorneo[];
  conciliacion: ConciliacionDelTorneo;
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

// Dar de baja a alguien que pagó: la organización dice si le corresponde la devolución (decisión 075).
export const bajaSchema = z.object(
  { devolucion: z.boolean({ error: 'Elegí si le corresponde la devolución' }) },
  { error: 'Elegí si le corresponde la devolución' },
);
export type DatosBaja = z.infer<typeof bajaSchema>;

// Inscribir a mano a quien pagó por fuera del sistema (05-pagos §8).
export const inscripcionManualSchema = z.object(
  {
    jugadorId: z.number({ error: 'Elegí al jugador' }).int().positive({ error: 'Elegí al jugador' }),
    medio: z.enum(['efectivo', 'transferencia', 'otro'], { error: 'Elegí cómo te pagó' }),
    monto: z
      .number({ error: 'Tiene que ser un número' })
      .min(0, { error: 'No puede ser negativo' })
      .max(100_000_000, { error: 'Es demasiado' }),
  },
  { error: 'Faltan los datos de la inscripción' },
);
export type DatosInscripcionManual = z.infer<typeof inscripcionManualSchema>;
