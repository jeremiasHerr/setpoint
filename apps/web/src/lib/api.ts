import { borrarSesion, leerSesion } from '../features/auth/sesion';

export class ErrorApi extends Error {
  codigo: string;
  campos: Record<string, string>;

  constructor(codigo: string, campos: Record<string, string> = {}) {
    super(codigo);
    this.codigo = codigo;
    this.campos = campos;
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Llama a la API con el token de la sesión, si hay. Los errores llegan como ErrorApi con el código de la API.
// Un FormData viaja como multipart: el navegador arma el Content-Type con su separador.
// `tokenDelJugador` es la sesión que deja el código al inscribirse, distinta de la del administrador.
export async function pedir<T>(metodo: Metodo, ruta: string, cuerpo?: unknown, tokenDelJugador?: string): Promise<T> {
  const token = tokenDelJugador ?? leerSesion()?.token;
  const esFormulario = cuerpo instanceof FormData;
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && !esFormulario && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo === undefined ? undefined : esFormulario ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi('SIN_CONEXION');
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // Token vencido o inválido: la sesión guardada ya no sirve.
    if (respuesta.status === 401 && !tokenDelJugador) borrarSesion();
    throw new ErrorApi(datos?.error ?? 'ERROR_INTERNO', datos?.campos);
  }
  return datos as T;
}
