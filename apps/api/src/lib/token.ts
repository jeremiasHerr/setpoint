import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el .env de la API');
}

const DURACION_TOKEN = '7d';

export function firmarToken(usuarioId: number) {
  return jwt.sign({}, JWT_SECRET!, { subject: String(usuarioId), expiresIn: DURACION_TOKEN });
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
