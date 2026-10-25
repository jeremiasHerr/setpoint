import { Router } from 'express';
import { limitePorIp } from '../../middleware/limite';
import { buscarEnElPadron } from './inscripcion.service';

// Se monta en /api/publico/:slug/torneos/:id/padron. Sin login: quien se inscribe por primera vez
// se busca por su apellido (decisión 051). Solo nombre y apellido, y con límite por IP (decisión 052).
export const padronPublicoRouter = Router({ mergeParams: true });

padronPublicoRouter.get('/', limitePorIp, async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  const consulta = typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '';
  res.json(await buscarEnElPadron(slug, Number(id), consulta));
});
