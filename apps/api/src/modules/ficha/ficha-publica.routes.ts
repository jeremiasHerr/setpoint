import { Router } from 'express';
import { caraACara, rivalesDelJugador } from './cara-a-cara.service';
import { fichaPublica } from './ficha-publica.service';

// Se monta en /api/publico/:slug/jugadores/:id. Sin login, como todo lo que cuelga de /api/publico
// (decisión 033): la ficha del jugador que se abre desde el ranking y desde las zonas (F17).
export const fichaPublicaRouter = Router({ mergeParams: true });

fichaPublicaRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await fichaPublica(slug, Number(id)));
});

// A quién se puede comparar y el cara a cara con un rival (F18). Los usan la web y, después, la app.
fichaPublicaRouter.get('/rivales', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await rivalesDelJugador(slug, Number(id)));
});

fichaPublicaRouter.get('/cara-a-cara/:rivalId', async (req, res) => {
  const { slug } = req.params as unknown as { slug: string };
  res.json(await caraACara(slug, req.params));
});
