import { Router } from 'express';
import { resolverRevisionSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { casoDeRevision, listarRevisiones, resolverRevision } from './revisiones.service';

// Se monta en /api/organizaciones/:slug/revisiones. Cada caso se identifica por el perfil del padrón.
export const revisionesRouter = Router({ mergeParams: true });

revisionesRouter.use(autenticar);

revisionesRouter.get('/', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await listarRevisiones(slug, res.locals.usuarioId));
});

revisionesRouter.get('/:jugadorId', async (req, res) => {
  const { slug, jugadorId } = req.params as { slug: string; jugadorId: string };
  res.json(await casoDeRevision(slug, res.locals.usuarioId, Number(jugadorId)));
});

revisionesRouter.post('/:jugadorId', validar(resolverRevisionSchema), async (req, res) => {
  const { slug, jugadorId } = req.params as { slug: string; jugadorId: string };
  res.json(await resolverRevision(slug, res.locals.usuarioId, Number(jugadorId), req.body));
});
