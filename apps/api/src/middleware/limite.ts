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

// Segunda capa para las rutas que llaman a un modelo (decisión 121): por usuario, en memoria. Frena
// a quien aprieta el botón en ráfaga sin gastar una consulta a la base. El límite que sobrevive a un
// reinicio, y el tope de gasto, se cuentan en la base (lib/limite-ia.ts). Va después de `autenticar`.
export const limiteDeIaPorUsuario = rateLimit({
  windowMs: 15 * 60_000,
  limit: 6,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (_req, res) => `usuario-${res.locals.usuarioId}`,
  handler: (_req, res) => {
    res.status(429).json({ error: 'LIMITE_DE_PEDIDOS_IA' });
  },
});
