import { rateLimit } from 'express-rate-limit';

// Límite por IP para lo que se puede pedir sin login, como los códigos de ingreso. Va en memoria:
// se reinicia con la API, y alcanza mientras haya una sola instancia (decisión 052). El límite por
// email y los intentos de cada código se cuentan en la base, aparte.
export const limitePorIp = rateLimit({
  windowMs: 15 * 60_000,
  // Holgado para varios jugadores detrás de la misma conexión, como en un club.
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'DEMASIADOS_PEDIDOS' });
  },
});
