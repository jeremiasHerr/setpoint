import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { aprobarSolicitud, cerrarInscripcion, obtenerInscripciones, rechazarSolicitud } from './inscripciones.service';

// Se monta en /api/organizaciones/:slug/torneos/:id/inscripciones: mergeParams trae el slug y el id.
// El id es el de un torneo (una categoría), no el de la convocatoria.
export const inscripcionesRouter = Router({ mergeParams: true });

inscripcionesRouter.use(autenticar);

inscripcionesRouter.get('/', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await obtenerInscripciones(slug, res.locals.usuarioId, Number(id)));
});

// Cierra la inscripción y la categoría queda lista para sortear. No se deshace.
inscripcionesRouter.post('/cerrar', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await cerrarInscripcion(slug, res.locals.usuarioId, Number(id)));
});

// Las solicitudes de un torneo con aprobación (decisión 054).
inscripcionesRouter.post('/:inscripcionId/aprobar', async (req, res) => {
  const { slug, id, inscripcionId } = req.params as { slug: string; id: string; inscripcionId: string };
  res.json(await aprobarSolicitud(slug, res.locals.usuarioId, Number(id), Number(inscripcionId)));
});

inscripcionesRouter.post('/:inscripcionId/rechazar', async (req, res) => {
  const { slug, id, inscripcionId } = req.params as { slug: string; id: string; inscripcionId: string };
  res.json(await rechazarSolicitud(slug, res.locals.usuarioId, Number(id), Number(inscripcionId)));
});
