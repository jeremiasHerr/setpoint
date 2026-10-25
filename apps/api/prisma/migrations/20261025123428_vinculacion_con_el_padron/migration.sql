-- CreateEnum
CREATE TYPE "Vinculacion" AS ENUM ('LINK_PERSONAL', 'BUSQUEDA', 'PROPUESTA');

-- CreateEnum
CREATE TYPE "MotivoRevision" AS ENUM ('HOMONIMO', 'RECLAMO');

-- DropIndex
DROP INDEX "jugadores_organizacionId_dni_key";

-- AlterTable
ALTER TABLE "inscripciones" ADD COLUMN     "usuarioId" INTEGER,
ADD COLUMN     "vinculaPor" "Vinculacion";

-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "revision" "MotivoRevision",
ADD COLUMN     "vinculadoEn" TIMESTAMP(3),
ADD COLUMN     "vinculadoPor" "Vinculacion";

-- CreateIndex
CREATE UNIQUE INDEX "jugadores_organizacionId_usuarioId_key" ON "jugadores"("organizacionId", "usuarioId");

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

