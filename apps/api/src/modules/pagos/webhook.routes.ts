import { Router } from 'express';
import { notificacionMercadoPagoSchema } from '@setpoint/shared';
import { procesarNotificacion } from './pagos.service';

// Se monta en /api/webhooks/mercadopago. MercadoPago avisa que un pago cambió; no se confía en lo
// que manda: se consulta el pago contra su API (05-pagos §5). Responde 200 a lo que no es un pago,
// para que no lo reenvíe, y 500 si algo falla, para que sí.
export const webhookRouter = Router();

webhookRouter.post('/', async (req, res) => {
  // Puede venir en el cuerpo o, en el formato viejo, en la query (?topic=payment&id=…).
  const query = req.query as Record<string, string | undefined>;
  const notificacion = notificacionMercadoPagoSchema.safeParse(
    req.body?.type ? req.body : { type: query.type ?? query.topic, data: { id: query['data.id'] ?? query.id } },
  );
  if (!notificacion.success || notificacion.data.type !== 'payment') {
    res.status(200).end();
    return;
  }
  await procesarNotificacion(notificacion.data.data.id);
  res.status(200).end();
});
