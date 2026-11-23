-- AlterEnum
ALTER TYPE "EstadoPartido" ADD VALUE 'DOBLE_WALKOVER';

-- AlterEnum
ALTER TYPE "TipoEventoCoordinacion" ADD VALUE 'PLAZO_EXTENDIDO';

-- AlterTable
ALTER TABLE "eventos_coordinacion" ADD COLUMN     "fechaLimite" TIMESTAMP(3);
