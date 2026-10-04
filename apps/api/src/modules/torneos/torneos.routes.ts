import { Router } from 'express';
import { convocatoriaSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import {
  crearConvocatoria,
  editarConvocatoria,
  listarConvocatorias,
  obtenerConvocatoria,
  publicarConvocatoria,
} from './torneos.service';

// Se monta en /api/organizaciones/:slug/torneos: mergeParams trae el slug del padre.
// El :id es el del primer torneo de la convocatoria (ver docs/decisiones/003).
export const torneosRouter = Router({ mergeParams: true });

torneosRouter.use(autenticar);

torneosRouter.get('/', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await listarConvocatorias(slug, res.locals.usuarioId));
});

torneosRouter.post('/', validar(convocatoriaSchema), async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.status(201).json(await crearConvocatoria(slug, res.locals.usuarioId, req.body));
});

torneosRouter.get('/:id', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerConvocatoria(slug, res.locals.usuarioId, Number(id)));
});

// Reemplaza la convocatoria completa, como el PUT del circuito: es lo que manda el autoguardado.
torneosRouter.put('/:id', validar(convocatoriaSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await editarConvocatoria(slug, res.locals.usuarioId, Number(id), req.body));
});

// Pasa la convocatoria de borrador a publicada y abre la inscripción.
torneosRouter.post('/:id/publicar', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await publicarConvocatoria(slug, res.locals.usuarioId, Number(id)));
});
