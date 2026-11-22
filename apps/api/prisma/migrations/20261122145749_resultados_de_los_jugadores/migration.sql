-- CreateEnum
CREATE TYPE "EstadoResultadoPropuesto" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'REEMPLAZADO');

-- CreateTable
CREATE TABLE "resultados_propuestos" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "cargadoPorId" INTEGER NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" "EstadoResultadoPropuesto" NOT NULL DEFAULT 'PENDIENTE',
    "resueltoPorId" INTEGER,
    "resueltoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_propuestos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resultados_propuestos_partidoId_estado_idx" ON "resultados_propuestos"("partidoId", "estado");

-- AddForeignKey
ALTER TABLE "resultados_propuestos" ADD CONSTRAINT "resultados_propuestos_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_propuestos" ADD CONSTRAINT "resultados_propuestos_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_propuestos" ADD CONSTRAINT "resultados_propuestos_cargadoPorId_fkey" FOREIGN KEY ("cargadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_propuestos" ADD CONSTRAINT "resultados_propuestos_resueltoPorId_fkey" FOREIGN KEY ("resueltoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
