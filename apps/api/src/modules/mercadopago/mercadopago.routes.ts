import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { desconectar, empezarConexion, terminarConexion } from './cuenta.service';

// Se monta en /api/organizaciones/:slug/mercadopago: quien administra conecta y desconecta la
// cuenta con la que cobra la organización (decisión 137).
export const cuentaMercadoPagoRouter = Router({ mergeParams: true });

cuentaMercadoPagoRouter.use(autenticar);

// Devuelve el link de MercadoPago: la web lleva ahí a la organización.
cuentaMercadoPagoRouter.post('/', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await empezarConexion(slug, res.locals.usuarioId));
});

cuentaMercadoPagoRouter.delete('/', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await desconectar(slug, res.locals.usuarioId));
});

// Se monta en /api/mercadopago/vuelta, la URL de redireccionamiento de la aplicación en
// MercadoPago. Sin login: la sesión de la web vive en el navegador y no viaja en esta redirección.
// De qué organización es lo dice el state, que solo conoce quien empezó la conexión.
export const vueltaMercadoPagoRouter = Router();

vueltaMercadoPagoRouter.get('/', async (req, res) => {
  res.redirect(await terminarConexion(req.query));
});
