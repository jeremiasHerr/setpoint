import { Router } from 'express';
import { pagoSimuladoSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { iniciarPago, inscripcionParaPagar, reservarAprobada, simularPago } from './pagos.service';

// Se monta en /api/inscripcion/:slug/inscripciones/:id. Con la sesión del código: solo quien
// reservó, o el dueño del perfil, ve y paga su inscripción.
export const pagoRouter = Router({ mergeParams: true });

pagoRouter.use(autenticar);

pagoRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await inscripcionParaPagar(slug, Number(id), res.locals.usuarioId));
});

// Una solicitud aprobada reserva el lugar al abrir el link para pagar (decisión 054).
pagoRouter.post('/reservar', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await reservarAprobada(slug, Number(id), res.locals.usuarioId));
});

pagoRouter.post('/pago', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await iniciarPago(slug, Number(id), res.locals.usuarioId));
});

// Solo sin credenciales de MercadoPago (decisión 053).
pagoRouter.post('/simulado', validar(pagoSimuladoSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  await simularPago(slug, Number(id), res.locals.usuarioId, req.body);
  res.status(204).end();
});
