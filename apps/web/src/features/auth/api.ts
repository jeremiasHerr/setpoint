import type { DatosRegistroOrganizacion, RespuestaRegistro } from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function registrarOrganizacion(datos: DatosRegistroOrganizacion) {
  return pedir<RespuestaRegistro>('POST', '/api/auth/registro', datos);
}
