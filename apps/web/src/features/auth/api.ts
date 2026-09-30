import type { DatosRegistroOrganizacion, RespuestaRegistro } from '@setpoint/shared';

export class ErrorApi extends Error {
  codigo: string;
  campos: Record<string, string>;

  constructor(codigo: string, campos: Record<string, string> = {}) {
    super(codigo);
    this.codigo = codigo;
    this.campos = campos;
  }
}

async function enviar<T>(ruta: string, cuerpo: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi('SIN_CONEXION');
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(datos?.error ?? 'ERROR_INTERNO', datos?.campos);
  }
  return datos as T;
}

export function registrarOrganizacion(datos: DatosRegistroOrganizacion) {
  return enviar<RespuestaRegistro>('/api/auth/registro', datos);
}
