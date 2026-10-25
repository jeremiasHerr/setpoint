import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { limitePorIp } from '../../middleware/limite';
import { linkPersonal, situacionDelLink } from './link-personal.service';

// Se monta en /api/links/:codigo. Sin login se ve de quién es el link, con límite por IP como todo
// lo público que resuelve un código (decisión 052). Con la sesión que deja el código, si le sirve a
// quien lo abrió: esa ya pasó por el límite del ingreso.
export const linkPersonalRouter = Router({ mergeParams: true });

linkPersonalRouter.get('/', limitePorIp, async (req, res) => {
  const { codigo } = req.params as { codigo: string };
  res.json(await linkPersonal(codigo));
});

linkPersonalRouter.get('/situacion', autenticar, async (req, res) => {
  const { codigo } = req.params as { codigo: string };
  res.json(await situacionDelLink(codigo, res.locals.usuarioId));
});
