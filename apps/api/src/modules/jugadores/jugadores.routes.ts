import { Router } from 'express';
import { crearJugadorSchema, editarJugadorSchema } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validar } from '../../middleware/validar';
import { crearJugador, desvincularCuenta, editarJugador, listarPadron } from './jugadores.service';

// Se monta en /api/organizaciones/:slug/jugadores: mergeParams trae el slug del padre.
export const jugadoresRouter = Router({ mergeParams: true });

jugadoresRouter.use(autenticar);

jugadoresRouter.get('/', async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json(await listarPadron(slug, res.locals.usuarioId));
});

jugadoresRouter.post('/', validar(crearJugadorSchema), async (req, res) => {
  const { slug } = req.params as { slug: string };
  res.status(201).json(await crearJugador(slug, res.locals.usuarioId, req.body));
});

jugadoresRouter.patch('/:id', validar(editarJugadorSchema), async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await editarJugador(slug, res.locals.usuarioId, Number(id), req.body));
});

// La organización revierte la vinculación de una cuenta de jugador con este perfil del padrón.
jugadoresRouter.delete('/:id/cuenta', async (req, res) => {
  const { slug, id } = req.params as { slug: string; id: string };
  res.json(await desvincularCuenta(slug, res.locals.usuarioId, Number(id)));
});
