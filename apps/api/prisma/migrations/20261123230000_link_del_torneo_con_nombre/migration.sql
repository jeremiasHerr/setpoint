-- AlterTable
ALTER TABLE "torneos" ADD COLUMN     "slugPublico" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "torneos_organizacionId_slugPublico_key" ON "torneos"("organizacionId", "slugPublico");

