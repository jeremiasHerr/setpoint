import { Router } from 'express';
import { torneoPublico } from './torneo-publico';

// Se monta en /api/publico/:slug/torneos/:id. Sin login, como todo lo que cuelga de /api/publico
// (decisión 033): es el link del torneo que la organización comparte en el grupo (F12).
export const torneoPublicoRouter = Router({ mergeParams: true });

torneoPublicoRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await torneoPublico(slug, Number(id)));
});
