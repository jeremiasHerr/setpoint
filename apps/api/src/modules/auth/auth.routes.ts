import { Router } from 'express';
import {
  ingresoSchema,
  pedirCodigoSchema,
  recuperarContrasenaSchema,
  registroOrganizacionSchema,
  restablecerContrasenaSchema,
  verificarCodigoSchema,
} from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { limitePorIp } from '../../middleware/limite';
import { validar } from '../../middleware/validar';
import {
  ingresar,
  pedirCodigo,
  pedirRecuperacion,
  registrarOrganizacion,
  restablecerContrasena,
  verificarCodigo,
} from './auth.service';
import { cuentaDe } from './cuenta.service';

export const authRouter = Router();

authRouter.post('/registro', validar(registroOrganizacionSchema), async (req, res) => {
  const respuesta = await registrarOrganizacion(req.body);
  res.status(201).json(respuesta);
});

authRouter.post('/ingreso', validar(ingresoSchema), async (req, res) => {
  res.json(await ingresar(req.body));
});

// El jugador entra con un código que le llega por email, sin contraseña (decisión 049). Pedirlo
// responde igual exista o no la cuenta.
authRouter.post('/codigo', limitePorIp, validar(pedirCodigoSchema), async (req, res) => {
  await pedirCodigo(req.body);
  res.status(204).end();
});

authRouter.post('/codigo/verificar', limitePorIp, validar(verificarCodigoSchema), async (req, res) => {
  res.json(await verificarCodigo(req.body));
});

// Manda el link para elegir una contraseña nueva. Responde igual exista o no la cuenta.
authRouter.post('/recuperar-contrasena', validar(recuperarContrasenaSchema), async (req, res) => {
  await pedirRecuperacion(req.body);
  res.status(204).end();
});

authRouter.post('/restablecer-contrasena', validar(restablecerContrasenaSchema), async (req, res) => {
  await restablecerContrasena(req.body);
  res.status(204).end();
});

// La app la pide al abrirse y al volver al frente: los circuitos, las inscripciones en curso y los
// avisos para mostrar una vez (decisión 054).
authRouter.get('/cuenta', autenticar, async (_req, res) => {
  res.json(await cuentaDe(res.locals.usuarioId));
});
