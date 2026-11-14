-- La importación pasa a ser un lote de archivos y hojas (decisión 012).
-- CreateTable
CREATE TABLE "hojas_importacion" (
    "id" SERIAL NOT NULL,
    "importacionId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "archivoNombre" TEXT NOT NULL,
    "hoja" TEXT NOT NULL,
    "estado" "EstadoProcesoIA" NOT NULL DEFAULT 'PENDIENTE',
    "respuestaCruda" JSONB,
    "resumen" JSONB,

    CONSTRAINT "hojas_importacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hojas_importacion_importacionId_idx" ON "hojas_importacion"("importacionId");

-- AddForeignKey
ALTER TABLE "hojas_importacion" ADD CONSTRAINT "hojas_importacion_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "importaciones_padron"("id") ON DELETE CASCADE ON UPDATE CASCADE;
