import { Router } from 'express';
import { registroOrganizacionSchema } from '@setpoint/shared';
import { validar } from '../../middleware/validar';
import { registrarOrganizacion } from './auth.service';

export const authRouter = Router();

authRouter.post('/registro', validar(registroOrganizacionSchema), async (req, res) => {
  const respuesta = await registrarOrganizacion(req.body);
  res.status(201).json(respuesta);
});
