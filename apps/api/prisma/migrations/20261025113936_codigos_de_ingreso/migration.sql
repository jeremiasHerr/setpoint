-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "codigos_ingreso" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "venceEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "codigos_ingreso_email_creadoEn_idx" ON "codigos_ingreso"("email", "creadoEn");
