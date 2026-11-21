-- F19 (decisión 119): la tabla pasa a guardar una lectura por pegado. No tenía uso, así que no tiene filas.

-- DropForeignKey
ALTER TABLE "extracciones_resultado" DROP CONSTRAINT "extracciones_resultado_partidoId_fkey";

-- DropIndex
DROP INDEX "extracciones_resultado_partidoId_idx";

-- AlterTable
ALTER TABLE "extracciones_resultado" DROP COLUMN "confirmadaEn",
DROP COLUMN "partidoId",
ADD COLUMN     "creadoPorId" INTEGER,
ADD COLUMN     "organizacionId" INTEGER NOT NULL,
ADD COLUMN     "resumen" JSONB,
ADD COLUMN     "torneoId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "extracciones_resultado_organizacionId_torneoId_idx" ON "extracciones_resultado"("organizacionId", "torneoId");

-- AddForeignKey
ALTER TABLE "extracciones_resultado" ADD CONSTRAINT "extracciones_resultado_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracciones_resultado" ADD CONSTRAINT "extracciones_resultado_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracciones_resultado" ADD CONSTRAINT "extracciones_resultado_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

