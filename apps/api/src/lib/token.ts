import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el .env de la API');
}

const DURACION_TOKEN = '7d';

export function firmarToken(usuarioId: number) {
  return jwt.sign({}, JWT_SECRET!, { subject: String(usuarioId), expiresIn: DURACION_TOKEN });
}
