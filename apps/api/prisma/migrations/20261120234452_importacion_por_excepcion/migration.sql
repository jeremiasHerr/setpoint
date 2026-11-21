-- AlterTable
ALTER TABLE "importaciones_padron" ADD COLUMN     "aplicadaEn" TIMESTAMP(3),
ADD COLUMN     "deshechaEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "importacionId" INTEGER;

-- AlterTable
ALTER TABLE "movimientos_ranking" ADD COLUMN     "importacionId" INTEGER;

-- CreateIndex
CREATE INDEX "movimientos_ranking_importacionId_idx" ON "movimientos_ranking"("importacionId");

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "importaciones_padron"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "importaciones_padron"("id") ON DELETE SET NULL ON UPDATE CASCADE;
