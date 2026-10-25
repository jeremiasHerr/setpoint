import { Router } from 'express';
import { reclamarPerfilSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { reclamarPerfil } from './reclamo.service';

// Se monta en /api/inscripcion/:slug/reclamos. Con la sesión del código: el caso lleva el email
// verificado de quien reclama.
export const reclamoRouter = Router({ mergeParams: true });

reclamoRouter.post('/', autenticar, validar(reclamarPerfilSchema), async (req, res) => {
  const { slug } = req.params as { slug: string };
  await reclamarPerfil(slug, res.locals.usuarioId, req.body);
  res.status(204).end();
});
