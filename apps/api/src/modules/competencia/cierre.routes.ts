import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { cerrarTorneo, obtenerCierre } from './cierre.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/cierre: mergeParams trae el slug y el id.
// Solo para quien administra la organización.
export const cierreRouter = Router({ mergeParams: true });

cierreRouter.use(autenticar);

// Qué va a pasar al cerrar, o qué pasó si ya se cerró.
cierreRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerCierre(slug, res.locals.usuarioId, Number(id)));
});

// Cierra el torneo y da los puntos. No se deshace.
cierreRouter.post('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await cerrarTorneo(slug, res.locals.usuarioId, Number(id)));
});
