import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { limitePorIp } from '../../middleware/limite';
import { linkPersonal, situacionDelLink } from './link-personal.service';

// Se monta en /api/links/:codigo. Sin login se ve de quién es el link; con la sesión que deja el
// código, si le sirve a quien lo abrió. Con límite por IP, como todo lo que resuelve un código.
export const linkPersonalRouter = Router({ mergeParams: true });

linkPersonalRouter.use(limitePorIp);

linkPersonalRouter.get('/', async (req, res) => {
  const { codigo } = req.params as { codigo: string };
  res.json(await linkPersonal(codigo));
});

linkPersonalRouter.get('/situacion', autenticar, async (req, res) => {
  const { codigo } = req.params as { codigo: string };
  res.json(await situacionDelLink(codigo, res.locals.usuarioId));
});
