import type { RequestHandler } from 'express';
import { verificarToken } from '../lib/token';

// Exige un token válido en Authorization: Bearer <token> y deja el usuario en res.locals.usuarioId.
export const autenticar: RequestHandler = (req, res, next) => {
  const [esquema, token] = req.headers.authorization?.split(' ') ?? [];
  const usuarioId = esquema === 'Bearer' && token ? verificarToken(token) : null;

  if (usuarioId === null) {
    res.status(401).json({ error: 'NO_AUTENTICADO' });
    return;
  }
  res.locals.usuarioId = usuarioId;
  next();
};
