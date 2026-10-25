import { Router } from 'express';
import { reservarSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { reservar, situacionEnElTorneo } from './inscripcion.service';

// Se monta en /api/inscripcion/:slug/torneos/:id. Pide la sesión que deja el código (decisión
// 049), pero no un perfil en la organización: es justo lo que se está por vincular.
export const inscripcionRouter = Router({ mergeParams: true });

inscripcionRouter.use(autenticar);

inscripcionRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await situacionEnElTorneo(slug, Number(id), res.locals.usuarioId));
});

inscripcionRouter.post('/', validar(reservarSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.status(201).json(await reservar(slug, Number(id), res.locals.usuarioId, req.body));
});
