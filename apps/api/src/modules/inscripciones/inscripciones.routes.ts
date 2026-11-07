import { bajaSchema, inscripcionManualSchema } from '@setpoint/shared';
import { Router } from 'express';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import {
  aprobarSolicitud,
  cerrarInscripcion,
  darDeBaja,
  inscribirAMano,
  marcarDevolucion,
  obtenerInscripciones,
  recordarPago,
  rechazarSolicitud,
} from './inscripciones.service';

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

// A quien pagó por fuera del sistema (05-pagos §8). Antes que las rutas con :inscripcionId.
inscripcionesRouter.post('/manual', validar(inscripcionManualSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await inscribirAMano(slug, res.locals.usuarioId, Number(id), req.body));
});

// Dar de baja a quien pagó, diciendo si le corresponde la devolución (decisión 075).
inscripcionesRouter.post('/:inscripcionId/baja', validar(bajaSchema), async (req, res) => {
  const { slug, id, inscripcionId } = req.params as { slug: string; id: string; inscripcionId: string };
  res.json(await darDeBaja(slug, res.locals.usuarioId, Number(id), Number(inscripcionId), req.body));
});

// La organización hizo la devolución, por fuera del sistema.
inscripcionesRouter.post('/:inscripcionId/devolucion', async (req, res) => {
  const { slug, id, inscripcionId } = req.params as { slug: string; id: string; inscripcionId: string };
  res.json(await marcarDevolucion(slug, res.locals.usuarioId, Number(id), Number(inscripcionId)));
});

// "Recordarle": otra vez el link para pagar una reserva.
inscripcionesRouter.post('/:inscripcionId/recordatorio', async (req, res) => {
  const { slug, id, inscripcionId } = req.params as { slug: string; id: string; inscripcionId: string };
  res.json(await recordarPago(slug, res.locals.usuarioId, Number(id), Number(inscripcionId)));
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
