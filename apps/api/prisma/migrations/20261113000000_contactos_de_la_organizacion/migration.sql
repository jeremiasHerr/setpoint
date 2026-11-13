-- CreateEnum
CREATE TYPE "TipoContacto" AS ENUM ('WHATSAPP', 'RED_SOCIAL');

-- CreateTable
CREATE TABLE "contactos_organizacion" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "tipo" "TipoContacto" NOT NULL,
    "valor" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "contactos_organizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contactos_organizacion_organizacionId_idx" ON "contactos_organizacion"("organizacionId");

-- AddForeignKey
ALTER TABLE "contactos_organizacion" ADD CONSTRAINT "contactos_organizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- El contacto de texto libre pasa a ser el primero de la lista: WhatsApp si es un número, red social si no.
INSERT INTO "contactos_organizacion" ("organizacionId", "tipo", "valor", "orden")
SELECT "id",
       CASE WHEN "contacto" ~ '^[0-9 +()-]+$' THEN 'WHATSAPP'::"TipoContacto" ELSE 'RED_SOCIAL'::"TipoContacto" END,
       trim("contacto"),
       0
FROM "organizaciones"
WHERE "contacto" IS NOT NULL AND trim("contacto") <> '';

-- AlterTable
ALTER TABLE "organizaciones" DROP COLUMN "contacto";
