-- CreateEnum
CREATE TYPE "EstadoJugador" AS ENUM ('PADRON', 'PENDIENTE', 'DESCARTADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoInscripcion" ADD VALUE 'SOLICITADA';
ALTER TYPE "EstadoInscripcion" ADD VALUE 'APROBADA';
ALTER TYPE "EstadoInscripcion" ADD VALUE 'NO_APROBADA';

-- AlterTable
ALTER TABLE "inscripciones" ADD COLUMN     "resueltaEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "estado" "EstadoJugador" NOT NULL DEFAULT 'PADRON';

