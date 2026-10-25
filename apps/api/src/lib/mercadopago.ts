import { pagoMercadoPagoSchema, type PagoMercadoPago } from '@setpoint/shared';
import { z } from 'zod';

// Checkout Pro de MercadoPago (05-pagos.md). Toda la recaudación entra a la cuenta de la
// plataforma; pasar a una cuenta por organización es cambiar el token que recibe esta función.
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const API = 'https://api.mercadopago.com';

// Sin token, el pago es simulado (decisión 053).
export function hayMercadoPago() {
  return Boolean(ACCESS_TOKEN);
}

type Preferencia = {
  inscripcionId: number;
  titulo: string;
  precio: number;
  // Adónde vuelve el jugador después del checkout. La confirmación no viene de ahí, sino del webhook.
  vuelta: string;
  webhook: string | null;
  // La preferencia vence con la reserva: así no se puede pagar un lugar que ya se liberó.
  vence: Date;
};

const preferenciaCreadaSchema = z.object({ id: z.string(), init_point: z.string(), sandbox_init_point: z.string().optional() });

export async function crearPreferencia(datos: Preferencia) {
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ title: datos.titulo, quantity: 1, unit_price: datos.precio, currency_id: 'ARS' }],
      // El hilo conductor entre el pago y la inscripción (04-flujo-jugador §5.4).
      external_reference: String(datos.inscripcionId),
      back_urls: { success: datos.vuelta, failure: datos.vuelta, pending: datos.vuelta },
      auto_return: 'approved',
      ...(datos.webhook && { notification_url: datos.webhook }),
      expires: true,
      expiration_date_to: datos.vence.toISOString(),
    }),
  });
  if (!respuesta.ok) throw new Error(`MercadoPago respondió ${respuesta.status} al crear la preferencia`);
  const preferencia = preferenciaCreadaSchema.parse(await respuesta.json());
  // Con las credenciales de prueba, el checkout es el del sandbox.
  const url = ACCESS_TOKEN!.startsWith('TEST-') ? (preferencia.sandbox_init_point ?? preferencia.init_point) : preferencia.init_point;
  return { id: preferencia.id, url };
}

// El webhook no confía en lo que recibe: consulta el pago acá.
export async function consultarPago(id: string): Promise<PagoMercadoPago> {
  const respuesta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (!respuesta.ok) throw new Error(`MercadoPago respondió ${respuesta.status} al consultar el pago ${id}`);
  return pagoMercadoPagoSchema.parse(await respuesta.json());
}
