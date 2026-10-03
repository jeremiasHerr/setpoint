import { Router } from 'express';
import { ingresoSchema, registroOrganizacionSchema } from '@setpoint/shared';
import { validar } from '../../middleware/validar';
import { ingresar, registrarOrganizacion } from './auth.service';

export const authRouter = Router();

authRouter.post('/registro', validar(registroOrganizacionSchema), async (req, res) => {
  const respuesta = await registrarOrganizacion(req.body);
  res.status(201).json(respuesta);
});

authRouter.post('/ingreso', validar(ingresoSchema), async (req, res) => {
  res.json(await ingresar(req.body));
});
