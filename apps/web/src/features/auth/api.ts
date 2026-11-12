import type {
  DatosConfirmarRegistro,
  DatosIngreso,
  DatosRegistroOrganizacion,
  DatosRestablecerContrasena,
  RespuestaRegistro,
} from '@setpoint/shared';
import { pedir } from '../../lib/api';

// La organización se crea con el código que llega al email (decisión 087).
export function pedirCodigoDeRegistro(datos: DatosRegistroOrganizacion) {
  return pedir<null>('POST', '/api/auth/registro/codigo', datos);
}

export function registrarOrganizacion(datos: DatosConfirmarRegistro) {
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
