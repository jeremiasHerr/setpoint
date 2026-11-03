import { Router } from 'express';
import { fechaAcordadaSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { anotarFechaPorLaOrganizacion, coordinacionDeLaOrganizacion } from './coordinacion.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/partidos/:partidoId/fecha. La organización
// carga la fecha en nombre de los jugadores (F14): ninguno queda bloqueado por no tener cuenta.
export const coordinacionRouter = Router({ mergeParams: true });

coordinacionRouter.use(autenticar);

type Parametros = { slug: string; id: string; partidoId: string };

coordinacionRouter.get('/', async (req, res) => {
  const { slug, id, partidoId } = req.params as Parametros;
  res.json(await coordinacionDeLaOrganizacion(slug, res.locals.usuarioId, Number(id), Number(partidoId)));
});

coordinacionRouter.put('/', validar(fechaAcordadaSchema), async (req, res) => {
  const { slug, id, partidoId } = req.params as Parametros;
  res.json(await anotarFechaPorLaOrganizacion(slug, res.locals.usuarioId, Number(id), Number(partidoId), req.body));
});
