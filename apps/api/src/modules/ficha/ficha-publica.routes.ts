import { Router } from 'express';
import { fichaPublica } from './ficha-publica.service';

// Se monta en /api/publico/:slug/jugadores/:id. Sin login, como todo lo que cuelga de /api/publico
// (decisión 033): la ficha del jugador que se abre desde el ranking y desde las zonas (F17).
export const fichaPublicaRouter = Router({ mergeParams: true });

fichaPublicaRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await fichaPublica(slug, Number(id)));
});
