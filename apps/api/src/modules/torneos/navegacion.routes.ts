import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { obtenerNavegacion } from './navegacion.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/navegacion: mergeParams trae el slug y el id.
// Solo para quien administra la organización: es la franja de sus pantallas del torneo.
export const navegacionRouter = Router({ mergeParams: true });

navegacionRouter.use(autenticar);

navegacionRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerNavegacion(slug, res.locals.usuarioId, Number(id)));
});
