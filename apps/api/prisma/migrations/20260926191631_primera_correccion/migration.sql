/*
  Warnings:

  - You are about to drop the column `grupoId` on the `inscripciones` table. All the data in the column will be lost.
  - You are about to drop the column `esWalkover` on the `partidos` table. All the data in the column will be lost.
  - You are about to drop the column `grupoId` on the `partidos` table. All the data in the column will be lost.
  - You are about to drop the `grupos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "grupos" DROP CONSTRAINT "grupos_torneoId_fkey";

-- DropForeignKey
ALTER TABLE "inscripciones" DROP CONSTRAINT "inscripciones_grupoId_fkey";

-- DropForeignKey
ALTER TABLE "partidos" DROP CONSTRAINT "partidos_grupoId_fkey";

-- DropIndex
DROP INDEX "inscripciones_grupoId_idx";

-- DropIndex
DROP INDEX "partidos_grupoId_idx";

-- AlterTable
ALTER TABLE "inscripciones" DROP COLUMN "grupoId",
ADD COLUMN     "grupo" TEXT;

-- AlterTable
ALTER TABLE "partidos" DROP COLUMN "esWalkover",
DROP COLUMN "grupoId",
ADD COLUMN     "grupo" TEXT;

-- DropTable
DROP TABLE "grupos";

-- CreateIndex
CREATE INDEX "inscripciones_torneoId_grupo_idx" ON "inscripciones"("torneoId", "grupo");

-- CreateIndex
CREATE INDEX "partidos_torneoId_grupo_idx" ON "partidos"("torneoId", "grupo");
