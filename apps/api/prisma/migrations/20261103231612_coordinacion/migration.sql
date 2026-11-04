-- CreateEnum
CREATE TYPE "TipoEventoCoordinacion" AS ENUM ('ANOTADA', 'CAMBIADA', 'REPROGRAMADA', 'CONFIRMADA');

-- AlterTable
ALTER TABLE "torneos" ADD COLUMN     "horasAntelacionReprogramar" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "reprogramacionesPermitidas" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "eventos_coordinacion" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "tipo" "TipoEventoCoordinacion" NOT NULL,
    "usuarioId" INTEGER,
    "porOrganizacion" BOOLEAN NOT NULL DEFAULT false,
    "fechaAcordada" TIMESTAMP(3),
    "clubId" INTEGER,
    "sedeTexto" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_coordinacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_coordinacion_partidoId_idx" ON "eventos_coordinacion"("partidoId");

-- AddForeignKey
ALTER TABLE "eventos_coordinacion" ADD CONSTRAINT "eventos_coordinacion_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_coordinacion" ADD CONSTRAINT "eventos_coordinacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
