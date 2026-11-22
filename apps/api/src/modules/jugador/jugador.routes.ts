import { Router } from 'express';
import { dispositivoSchema, fechaAcordadaSchema, resultadoDelJugadorSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { borrarDispositivo, guardarDispositivo } from '../avisos/avisos.service';
import { anotarFecha, confirmarFecha, coordinacionDelJugador } from '../coordinacion/coordinacion.service';
import {
  cargaDelResultado,
  cargarResultadoDelJugador,
  confirmarResultadoDelJugador,
  rechazarResultadoDelJugador,
} from '../resultado-del-jugador/resultado-del-jugador.service';
import { miZona } from './mi-zona.service';
import { misPartidos } from './mis-partidos.service';

// Se monta en /api/jugador/:slug. Lo que ve el jugador de sí mismo en la app: pide login y un
// perfil de jugador activo en la organización (decisión 044).
export const jugadorRouter = Router({ mergeParams: true });

jugadorRouter.use(autenticar);

jugadorRouter.get('/zona', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await miZona(slug, res.locals.usuarioId));
});

jugadorRouter.get('/partidos', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await misPartidos(slug, res.locals.usuarioId));
});

// Coordinación de un partido suyo (F14): lo que necesita Anotar la fecha.
jugadorRouter.get('/partidos/:partidoId/coordinacion', async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await coordinacionDelJugador(slug, res.locals.usuarioId, Number(partidoId)));
});

// Anotar, cambiar o reprogramar la fecha acordada: queda esperando que el rival confirme.
jugadorRouter.put('/partidos/:partidoId/fecha', validar(fechaAcordadaSchema), async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await anotarFecha(slug, res.locals.usuarioId, Number(partidoId), req.body));
});

// El rival confirma que está al tanto de la fecha (04-flujo-jugador §6.3).
jugadorRouter.post('/partidos/:partidoId/confirmacion', async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await confirmarFecha(slug, res.locals.usuarioId, Number(partidoId)));
});

// El resultado de un partido suyo, si la organización lo permite (decisión 127): queda pendiente
// hasta que el rival lo confirme. Devuelven Cuándo juego actualizado.
jugadorRouter.get('/partidos/:partidoId/resultado', async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await cargaDelResultado(slug, res.locals.usuarioId, Number(partidoId)));
});

jugadorRouter.put('/partidos/:partidoId/resultado', validar(resultadoDelJugadorSchema), async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await cargarResultadoDelJugador(slug, res.locals.usuarioId, Number(partidoId), req.body));
});

jugadorRouter.post('/partidos/:partidoId/resultado/confirmacion', async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await confirmarResultadoDelJugador(slug, res.locals.usuarioId, Number(partidoId)));
});

jugadorRouter.post('/partidos/:partidoId/resultado/rechazo', async (req, res) => {
  const { slug, partidoId } = req.params as { slug: string; partidoId: string };
  res.json(await rechazarResultadoDelJugador(slug, res.locals.usuarioId, Number(partidoId)));
});

// El celular donde recibe los avisos (decisión 047). La app lo manda al entrar y lo borra al salir.
jugadorRouter.put('/dispositivo', validar(dispositivoSchema), async (req, res) => {
  const { slug } = req.params as { slug: string };
  await guardarDispositivo(slug, res.locals.usuarioId, req.body);
  res.status(204).end();
});

jugadorRouter.delete('/dispositivo', validar(dispositivoSchema), async (req, res) => {
  await borrarDispositivo(res.locals.usuarioId, req.body);
  res.status(204).end();
});
