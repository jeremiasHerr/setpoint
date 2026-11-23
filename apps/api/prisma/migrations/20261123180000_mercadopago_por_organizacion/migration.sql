-- AlterTable
ALTER TABLE "cuentas_cobro" ADD COLUMN     "conectadaEn" TIMESTAMP(3),
ADD COLUMN     "conexionEstado" TEXT,
ADD COLUMN     "conexionVence" TIMESTAMP(3),
ADD COLUMN     "conexionVerificador" TEXT,
ADD COLUMN     "mpNombre" TEXT,
ADD COLUMN     "mpUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_cobro_conexionEstado_key" ON "cuentas_cobro"("conexionEstado");

