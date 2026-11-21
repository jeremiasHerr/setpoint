import { Router } from 'express';
import { decidirResultadoLeidoSchema, leerMensajesSchema } from '@setpoint/shared';
import { autenticar } from '../../../middleware/autenticar';
import { validar } from '../../../middleware/validar';
import { decidirResultado, leerMensajes, obtenerLectura } from './mensajes.service';

// La IA tarda unos segundos con unos pocos mensajes, y puede reintentar una vez.
const TIEMPO_MAXIMO_MS = 120_000;

// Se monta en /api/organizaciones/:slug/torneos/:id/mensajes: mergeParams trae el slug y el id.
// Como la carga a mano, solo para quien administra (decisión 119).
export const mensajesRouter = Router({ mergeParams: true });

mensajesRouter.use(autenticar);

mensajesRouter.post(
  '/',
  (req, res, next) => {
    req.setTimeout(TIEMPO_MAXIMO_MS);
    res.setTimeout(TIEMPO_MAXIMO_MS);
    next();
  },
  validar(leerMensajesSchema),
  async (req, res) => {
    const { slug, id } = req.params as { slug: string; id: string };
    res.status(201).json(await leerMensajes(slug, res.locals.usuarioId, Number(id), req.body.texto));
  },
);

mensajesRouter.get('/:lectura', async (req, res) => {
  const { slug, id, lectura } = req.params as { slug: string; id: string; lectura: string };
  res.json(await obtenerLectura(slug, res.locals.usuarioId, Number(id), Number(lectura)));
});

mensajesRouter.post('/:lectura/resultados/:n', validar(decidirResultadoLeidoSchema), async (req, res) => {
  const { slug, id, lectura, n } = req.params as { slug: string; id: string; lectura: string; n: string };
  res.json(await decidirResultado(slug, res.locals.usuarioId, Number(id), Number(lectura), Number(n), req.body.accion));
});
