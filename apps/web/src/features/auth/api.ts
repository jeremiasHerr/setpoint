import type {
  DatosIngreso,
  DatosRegistroOrganizacion,
  DatosRestablecerContrasena,
  RespuestaRegistro,
} from '@setpoint/shared';
import { pedir } from '../../lib/api';

export function registrarOrganizacion(datos: DatosRegistroOrganizacion) {
  return pedir<RespuestaRegistro>('POST', '/api/auth/registro', datos);
}

export function ingresar(datos: DatosIngreso) {
  return pedir<RespuestaRegistro>('POST', '/api/auth/ingreso', datos);
}

// Responde igual exista o no la cuenta: la pantalla no puede saber si el mail salió.
export function pedirRecuperacion(email: string) {
  return pedir<null>('POST', '/api/auth/recuperar-contrasena', { email });
}

export function restablecerContrasena(datos: DatosRestablecerContrasena) {
  return pedir<null>('POST', '/api/auth/restablecer-contrasena', datos);
}
