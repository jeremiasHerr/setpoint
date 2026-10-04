import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el .env de la API');
}

const DURACION_TOKEN = '7d';

export function firmarToken(usuarioId: number) {
  return jwt.sign({}, JWT_SECRET!, { subject: String(usuarioId), expiresIn: DURACION_TOKEN });
}

const DURACION_TOKEN_RECUPERACION = '1h';

// Token del link para elegir una contraseña nueva. Se firma con el secreto MÁS el hash de la
// contraseña actual: al cambiarla, la firma deja de valer y el link no se puede usar dos veces.
// No hace falta una tabla de tokens (ver docs/decisiones/006-recuperar-la-contrasena.md).
export function firmarTokenRecuperacion(usuarioId: number, passwordHash: string) {
  return jwt.sign({ uso: 'recuperar' }, JWT_SECRET + passwordHash, {
    subject: String(usuarioId),
    expiresIn: DURACION_TOKEN_RECUPERACION,
  });
}

// De quién dice ser el token, SIN verificar la firma: solo sirve para ir a buscar el hash
// con el que después se verifica.
export function usuarioDeTokenRecuperacion(token: string): number | null {
  const contenido = jwt.decode(token);
  const usuarioId = typeof contenido === 'object' && contenido !== null ? Number(contenido.sub) : NaN;
  return Number.isInteger(usuarioId) ? usuarioId : null;
}

export function tokenRecuperacionValido(token: string, passwordHash: string) {
  try {
    const contenido = jwt.verify(token, JWT_SECRET + passwordHash);
    // Un token de sesión no sirve para cambiar la contraseña.
    return typeof contenido === 'object' && contenido.uso === 'recuperar';
  } catch {
    return false;
  }
}

// Devuelve el id del usuario, o null si el token no es valido o venció.
export function verificarToken(token: string): number | null {
  try {
    const { sub } = jwt.verify(token, JWT_SECRET!);
    const usuarioId = Number(sub);
    return Number.isInteger(usuarioId) ? usuarioId : null;
  } catch {
    return null;
  }
}
