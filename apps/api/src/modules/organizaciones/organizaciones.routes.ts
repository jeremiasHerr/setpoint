import { Router } from 'express';
import { configuracionCircuitoSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { guardarCircuito, obtenerCircuito } from './circuito.service';

export const organizacionesRouter = Router();

organizacionesRouter.use(autenticar);

organizacionesRouter.get('/:slug/circuito', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await obtenerCircuito(slug, res.locals.usuarioId));
});

organizacionesRouter.put('/:slug/circuito', validar(configuracionCircuitoSchema), async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await guardarCircuito(slug, res.locals.usuarioId, req.body));
});
