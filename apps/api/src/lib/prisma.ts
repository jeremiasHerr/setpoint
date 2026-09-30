import { PrismaClient } from '@prisma/client';

// Una sola instancia para toda la API: cada PrismaClient abre su propio pool de conexiones.
export const prisma = new PrismaClient();
