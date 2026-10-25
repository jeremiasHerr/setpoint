-- AlterTable
ALTER TABLE "jugadores" ADD COLUMN     "reclamadoEn" TIMESTAMP(3),
ADD COLUMN     "reclamadoPorId" INTEGER;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_reclamadoPorId_fkey" FOREIGN KEY ("reclamadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

