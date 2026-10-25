import { z } from 'zod';

// El pago de la inscripción (F12, 05-pagos.md).

export type EstadoDeLaInscripcion = 'reservando' | 'pagada' | 'vencida' | 'rechazada' | 'cancelada';

// Lo que muestra la pantalla de pago: la espera, el final y los errores.
export type InscripcionParaPagar = {
  id: number;
  estado: EstadoDeLaInscripcion;
  reservaVence: string | null;
  torneo: { id: number; nombre: string; categoria: string; organizacion: { nombre: string; slug: string } };
  jugador: { nombre: string; apellido: string };
  precio: number;
  // El email verificado de la persona, al que va el comprobante.
  email: string;
  // Sin credenciales de MercadoPago, la pantalla ofrece un pago simulado (decisión 053).
  pagoSimulado: boolean;
};

// El link del checkout de MercadoPago. null si el pago es simulado o si el torneo es gratis.
export type InicioDePago = { url: string | null };

export const pagoSimuladoSchema = z.object({ resultado: z.enum(['aprobado', 'rechazado']) }, { error: 'Falta el resultado' });
export type DatosPagoSimulado = z.infer<typeof pagoSimuladoSchema>;

// La notificación que manda MercadoPago al webhook. No se confía en ella: solo dice qué pago
// consultar (05-pagos §5).
export const notificacionMercadoPagoSchema = z.object({
  type: z.string(),
  data: z.object({ id: z.union([z.string(), z.number()]).transform(String) }),
});

// Lo que se usa del pago que devuelve la API de MercadoPago.
export const pagoMercadoPagoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  status: z.string(),
  external_reference: z.string().nullable(),
  transaction_amount: z.number(),
});

export type PagoMercadoPago = z.infer<typeof pagoMercadoPagoSchema>;
