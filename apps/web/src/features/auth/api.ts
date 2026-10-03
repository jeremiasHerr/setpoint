import type { DatosIngreso, DatosRegistroOrganizacion, RespuestaRegistro } from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function registrarOrganizacion(datos: DatosRegistroOrganizacion) {
  return pedir<RespuestaRegistro>('POST', '/api/auth/registro', datos);
}

export function ingresar(datos: DatosIngreso) {
  return pedir<RespuestaRegistro>('POST', '/api/auth/ingreso', datos);
}
