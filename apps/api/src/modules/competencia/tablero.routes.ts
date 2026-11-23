import { Router } from 'express';
import { extenderPlazoSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { extenderPlazo, recordarPartido } from './acciones-del-tablero.service';
import { obtenerTablero } from './tablero.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/tablero: mergeParams trae el slug y el id.
// Solo para quien administra la organización: incluye el teléfono de los jugadores.
export const tableroRouter = Router({ mergeParams: true });

tableroRouter.use(autenticar);

tableroRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerTablero(slug, res.locals.usuarioId, Number(id)));
});

// Corre la fecha límite de un partido pendiente (decisión 135). Devuelve el tablero como quedó.
tableroRouter.patch('/partidos/:partidoId/plazo', validar(extenderPlazoSchema), async (req, res) => {
  const { slug, id, partidoId } = req.params as { slug: string; id: string; partidoId: string };
  res.json(await extenderPlazo(slug, res.locals.usuarioId, Number(id), Number(partidoId), req.body));
});

// Les recuerda el partido a los dos jugadores, por aviso al celular y por email (decisión 135).
tableroRouter.post('/partidos/:partidoId/recordatorio', async (req, res) => {
  const { slug, id, partidoId } = req.params as { slug: string; id: string; partidoId: string };
  res.json(await recordarPartido(slug, res.locals.usuarioId, Number(id), Number(partidoId)));
});
