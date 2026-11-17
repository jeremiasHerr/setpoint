import { Router } from 'express';
import { proyeccionPublica } from './proyeccion-publica.service';

// Se monta en /api/publico/:slug/torneos/:id/proyeccion. Sin login, como todo lo que cuelga de
// /api/publico (decisión 033): qué está en juego para un jugador en ese torneo (F20, decisión 106).
export const proyeccionPublicaRouter = Router({ mergeParams: true });

proyeccionPublicaRouter.get('/:jugadorId', async (req, res) => {
  const { slug, id, jugadorId } = req.params as { slug: string; id: string; jugadorId: string };
  res.json(await proyeccionPublica(slug, Number(id), Number(jugadorId)));
});
