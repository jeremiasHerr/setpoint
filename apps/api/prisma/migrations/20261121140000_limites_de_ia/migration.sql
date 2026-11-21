-- CreateEnum
CREATE TYPE "FuncionIA" AS ENUM ('IMPORTACION', 'RESULTADOS');

-- CreateTable
CREATE TABLE "usos_ia" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "funcion" "FuncionIA" NOT NULL,
    "tokensEntrada" INTEGER NOT NULL DEFAULT 0,
    "tokensSalida" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usos_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usos_ia_organizacionId_creadoEn_idx" ON "usos_ia"("organizacionId", "creadoEn");

-- CreateIndex
CREATE INDEX "usos_ia_usuarioId_creadoEn_idx" ON "usos_ia"("usuarioId", "creadoEn");

-- AddForeignKey
ALTER TABLE "usos_ia" ADD CONSTRAINT "usos_ia_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usos_ia" ADD CONSTRAINT "usos_ia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
