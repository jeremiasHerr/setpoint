import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';

export class ErrorHttp extends Error {
  constructor(
    public estado: number,
    public codigo: string,
  ) {
    super(codigo);
  }
}

export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorHttp) {
    res.status(err.estado).json({ error: err.codigo });
    return;
  }

  // Violación de un @unique: dos pedidos simultáneos pasaron el chequeo previo.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: 'CONFLICTO' });
    return;
  }

  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON_INVALIDO' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'ERROR_INTERNO' });
};
