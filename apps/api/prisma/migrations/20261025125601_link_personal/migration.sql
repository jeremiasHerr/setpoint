-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "codigoLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "jugadores_codigoLink_key" ON "jugadores"("codigoLink");

