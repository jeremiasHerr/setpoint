import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { obtenerTablero } from './tablero.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/tablero: mergeParams trae el slug y el id.
// Solo para quien administra la organización: incluye el teléfono de los jugadores.
export const tableroRouter = Router({ mergeParams: true });

tableroRouter.use(autenticar);

tableroRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerTablero(slug, res.locals.usuarioId, Number(id)));
});
