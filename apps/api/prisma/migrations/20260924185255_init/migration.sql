-- CreateEnum
CREATE TYPE "ModoInscripcion" AS ENUM ('CERRADA', 'CON_APROBACION', 'ABIERTA');

-- CreateEnum
CREATE TYPE "ModoDistribucion" AS ENUM ('SERPENTINA', 'DIRECTA', 'BOMBOS');

-- CreateEnum
CREATE TYPE "ModoSorteo" AS ENUM ('AUTOMATICO', 'ASISTIDO', 'MANUAL');

-- CreateEnum
CREATE TYPE "QuienCargaResultados" AS ENUM ('ORGANIZACION', 'ORGANIZACION_Y_JUGADORES');

-- CreateEnum
CREATE TYPE "ModoSede" AS ENUM ('LIBRE', 'DESIGNADA');

-- CreateEnum
CREATE TYPE "Superficie" AS ENUM ('POLVO_LADRILLO', 'CEMENTO', 'SINTETICO', 'CARPETA', 'OTRA');

-- CreateEnum
CREATE TYPE "TerceroSet" AS ENUM ('SET_COMPLETO', 'SUPER_TIEBREAK');

-- CreateEnum
CREATE TYPE "EstadoTorneo" AS ENUM ('BORRADOR', 'PUBLICADO', 'INSCRIPCIONES_CERRADAS', 'ZONAS_GENERADAS', 'GRUPOS_EN_CURSO', 'ELIMINATORIAS', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('PENDIENTE_PAGO', 'PAGADA', 'EXPIRADA', 'RECHAZADA', 'CANCELADA', 'EN_LISTA_ESPERA');

-- CreateEnum
CREATE TYPE "MedioPago" AS ENUM ('MERCADOPAGO', 'EFECTIVO', 'TRANSFERENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "TipoCuentaCobro" AS ENUM ('PLATAFORMA', 'PROPIA');

-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('PENDIENTE', 'PAGADA');

-- CreateEnum
CREATE TYPE "Cuadro" AS ENUM ('CAMPEONATO', 'COMPLEMENTARIA');

-- CreateEnum
CREATE TYPE "FasePartido" AS ENUM ('GRUPOS', 'ELIMINATORIA');

-- CreateEnum
CREATE TYPE "EstadoPartido" AS ENUM ('PENDIENTE_COORDINACION', 'ANOTADA', 'CONFIRMADA', 'JUGADA', 'VENCIDA', 'WALKOVER', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Instancia" AS ENUM ('CAMPEON', 'FINALISTA', 'SEMIFINALISTA', 'CUARTOS', 'OCTAVOS', 'DIECISEISAVOS', 'PARTICIPACION');

-- CreateEnum
CREATE TYPE "MotivoMovimiento" AS ENUM ('IMPORTACION_INICIAL', 'RESULTADO_TORNEO', 'AJUSTE_MANUAL', 'REVERSION');

-- CreateEnum
CREATE TYPE "EstadoProcesoIA" AS ENUM ('PENDIENTE', 'PROCESADO', 'CONFIRMADO', 'DESCARTADO', 'ERROR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "contacto" TEXT,
    "usaRanking" BOOLEAN NOT NULL DEFAULT true,
    "ventanaRankingMeses" INTEGER NOT NULL DEFAULT 12,
    "soloMejoresN" INTEGER,
    "puntosJugadorNuevo" INTEGER NOT NULL DEFAULT 0,
    "quienCargaResultados" "QuienCargaResultados" NOT NULL DEFAULT 'ORGANIZACION',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins_organizacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_organizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "etapas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntajes_instancia" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "instancia" "Instancia" NOT NULL,
    "puntos" INTEGER NOT NULL,

    CONSTRAINT "puntajes_instancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubes" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,

    CONSTRAINT "clubes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "superficie" "Superficie" NOT NULL DEFAULT 'POLVO_LADRILLO',

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jugadores" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "categoriaId" INTEGER,
    "usuarioId" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "fotoUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jugadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "etapaId" INTEGER,
    "clubSedeId" INTEGER,
    "nombre" TEXT NOT NULL,
    "edicion" TEXT,
    "descripcion" TEXT,
    "estado" "EstadoTorneo" NOT NULL DEFAULT 'BORRADOR',
    "cupo" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "modoInscripcion" "ModoInscripcion" NOT NULL DEFAULT 'CERRADA',
    "minutosReservaCupo" INTEGER NOT NULL DEFAULT 15,
    "tieneListaEspera" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "cierreInscripcion" TIMESTAMP(3),
    "plazoGruposDias" INTEGER NOT NULL DEFAULT 21,
    "plazoPorRondaDias" INTEGER NOT NULL DEFAULT 7,
    "cantidadGrupos" INTEGER NOT NULL DEFAULT 8,
    "clasificanPorGrupo" INTEGER NOT NULL DEFAULT 2,
    "tieneComplementaria" BOOLEAN NOT NULL DEFAULT true,
    "modoDistribucion" "ModoDistribucion" NOT NULL DEFAULT 'SERPENTINA',
    "modoSorteo" "ModoSorteo" NOT NULL DEFAULT 'MANUAL',
    "sorteoConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "gruposCerrados" BOOLEAN NOT NULL DEFAULT false,
    "setsPorPartido" INTEGER NOT NULL DEFAULT 3,
    "puntoDeOro" BOOLEAN NOT NULL DEFAULT true,
    "terceroSet" "TerceroSet" NOT NULL DEFAULT 'SUPER_TIEBREAK',
    "gamesPorSet" INTEGER NOT NULL DEFAULT 6,
    "puntosTieBreak" INTEGER NOT NULL DEFAULT 7,
    "puntosSuperTieBreak" INTEGER NOT NULL DEFAULT 10,
    "sedeGrupos" "ModoSede" NOT NULL DEFAULT 'LIBRE',
    "sedeEliminatorias" "ModoSede" NOT NULL DEFAULT 'DESIGNADA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "torneos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" SERIAL NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "grupoId" INTEGER,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "reservaVence" TIMESTAMP(3),
    "ordenListaEspera" INTEGER,
    "posicionSiembra" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "medio" "MedioPago" NOT NULL DEFAULT 'MERCADOPAGO',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "monto" DECIMAL(12,2) NOT NULL,
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "payloadCrudo" JSONB,
    "requiereDevolucion" BOOLEAN NOT NULL DEFAULT false,
    "devueltoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_cobro" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "tipo" "TipoCuentaCobro" NOT NULL DEFAULT 'PLATAFORMA',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenVence" TIMESTAMP(3),

    CONSTRAINT "cuentas_cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidaciones" (
    "id" SERIAL NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "montoRecaudado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "comision" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "montoOrganizacion" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'PENDIENTE',
    "pagadaEn" TIMESTAMP(3),

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" SERIAL NOT NULL,
    "torneoId" INTEGER NOT NULL,
    "fase" "FasePartido" NOT NULL,
    "grupoId" INTEGER,
    "cuadro" "Cuadro",
    "ronda" INTEGER,
    "ordenEnRonda" INTEGER,
    "siguientePartidoId" INTEGER,
    "jugadorAId" INTEGER,
    "jugadorBId" INTEGER,
    "ganadorId" INTEGER,
    "estado" "EstadoPartido" NOT NULL DEFAULT 'PENDIENTE_COORDINACION',
    "fechaLimite" TIMESTAMP(3),
    "fechaAcordada" TIMESTAMP(3),
    "clubId" INTEGER,
    "canchaId" INTEGER,
    "sedeTexto" TEXT,
    "anotadaPorId" INTEGER,
    "confirmadaPorId" INTEGER,
    "reprogramaciones" INTEGER NOT NULL DEFAULT 0,
    "esWalkover" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets_partido" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "gamesA" INTEGER NOT NULL,
    "gamesB" INTEGER NOT NULL,
    "tieBreakA" INTEGER,
    "tieBreakB" INTEGER,
    "esSuperTieBreak" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sets_partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_ranking" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "etapaId" INTEGER,
    "torneoId" INTEGER,
    "puntos" INTEGER NOT NULL,
    "instancia" "Instancia",
    "motivo" "MotivoMovimiento" NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importaciones_padron" (
    "id" SERIAL NOT NULL,
    "organizacionId" INTEGER NOT NULL,
    "archivoNombre" TEXT NOT NULL,
    "archivoUrl" TEXT,
    "respuestaCruda" JSONB,
    "resumen" JSONB,
    "estado" "EstadoProcesoIA" NOT NULL DEFAULT 'PENDIENTE',
    "confirmadaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importaciones_padron_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracciones_resultado" (
    "id" SERIAL NOT NULL,
    "partidoId" INTEGER,
    "entradaCruda" TEXT NOT NULL,
    "respuestaCruda" JSONB,
    "estado" "EstadoProcesoIA" NOT NULL DEFAULT 'PENDIENTE',
    "confirmadaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracciones_resultado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizaciones_slug_key" ON "organizaciones"("slug");

-- CreateIndex
CREATE INDEX "admins_organizacion_organizacionId_idx" ON "admins_organizacion"("organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_organizacion_usuarioId_organizacionId_key" ON "admins_organizacion"("usuarioId", "organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_organizacionId_nombre_key" ON "categorias"("organizacionId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_organizacionId_nombre_key" ON "etapas"("organizacionId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "puntajes_instancia_organizacionId_instancia_key" ON "puntajes_instancia"("organizacionId", "instancia");

-- CreateIndex
CREATE UNIQUE INDEX "clubes_organizacionId_nombre_key" ON "clubes"("organizacionId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "canchas_clubId_nombre_key" ON "canchas"("clubId", "nombre");

-- CreateIndex
CREATE INDEX "jugadores_organizacionId_apellido_idx" ON "jugadores"("organizacionId", "apellido");

-- CreateIndex
CREATE INDEX "jugadores_organizacionId_categoriaId_idx" ON "jugadores"("organizacionId", "categoriaId");

-- CreateIndex
CREATE INDEX "jugadores_usuarioId_idx" ON "jugadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "jugadores_organizacionId_dni_key" ON "jugadores"("organizacionId", "dni");

-- CreateIndex
CREATE INDEX "torneos_organizacionId_estado_idx" ON "torneos"("organizacionId", "estado");

-- CreateIndex
CREATE INDEX "torneos_etapaId_idx" ON "torneos"("etapaId");

-- CreateIndex
CREATE INDEX "torneos_categoriaId_idx" ON "torneos"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "torneos_organizacionId_edicion_categoriaId_key" ON "torneos"("organizacionId", "edicion", "categoriaId");

-- CreateIndex
CREATE INDEX "inscripciones_torneoId_estado_idx" ON "inscripciones"("torneoId", "estado");

-- CreateIndex
CREATE INDEX "inscripciones_jugadorId_idx" ON "inscripciones"("jugadorId");

-- CreateIndex
CREATE INDEX "inscripciones_grupoId_idx" ON "inscripciones"("grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_torneoId_jugadorId_key" ON "inscripciones"("torneoId", "jugadorId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_inscripcionId_key" ON "pagos"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_mpPaymentId_key" ON "pagos"("mpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_cobro_organizacionId_key" ON "cuentas_cobro"("organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_torneoId_key" ON "liquidaciones"("torneoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_torneoId_nombre_key" ON "grupos"("torneoId", "nombre");

-- CreateIndex
CREATE INDEX "partidos_torneoId_fase_idx" ON "partidos"("torneoId", "fase");

-- CreateIndex
CREATE INDEX "partidos_torneoId_estado_idx" ON "partidos"("torneoId", "estado");

-- CreateIndex
CREATE INDEX "partidos_grupoId_idx" ON "partidos"("grupoId");

-- CreateIndex
CREATE INDEX "partidos_jugadorAId_idx" ON "partidos"("jugadorAId");

-- CreateIndex
CREATE INDEX "partidos_jugadorBId_idx" ON "partidos"("jugadorBId");

-- CreateIndex
CREATE UNIQUE INDEX "sets_partido_partidoId_numero_key" ON "sets_partido"("partidoId", "numero");

-- CreateIndex
CREATE INDEX "movimientos_ranking_organizacionId_categoriaId_idx" ON "movimientos_ranking"("organizacionId", "categoriaId");

-- CreateIndex
CREATE INDEX "movimientos_ranking_jugadorId_categoriaId_etapaId_idx" ON "movimientos_ranking"("jugadorId", "categoriaId", "etapaId");

-- CreateIndex
CREATE INDEX "movimientos_ranking_torneoId_idx" ON "movimientos_ranking"("torneoId");

-- CreateIndex
CREATE INDEX "importaciones_padron_organizacionId_idx" ON "importaciones_padron"("organizacionId");

-- CreateIndex
CREATE INDEX "extracciones_resultado_partidoId_idx" ON "extracciones_resultado"("partidoId");

-- AddForeignKey
ALTER TABLE "admins_organizacion" ADD CONSTRAINT "admins_organizacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins_organizacion" ADD CONSTRAINT "admins_organizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas" ADD CONSTRAINT "etapas_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntajes_instancia" ADD CONSTRAINT "puntajes_instancia_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubes" ADD CONSTRAINT "clubes_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "etapas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_clubSedeId_fkey" FOREIGN KEY ("clubSedeId") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "jugadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_cobro" ADD CONSTRAINT "cuentas_cobro_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_jugadorAId_fkey" FOREIGN KEY ("jugadorAId") REFERENCES "jugadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_jugadorBId_fkey" FOREIGN KEY ("jugadorBId") REFERENCES "jugadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_ganadorId_fkey" FOREIGN KEY ("ganadorId") REFERENCES "jugadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "canchas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_anotadaPorId_fkey" FOREIGN KEY ("anotadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_confirmadaPorId_fkey" FOREIGN KEY ("confirmadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_siguientePartidoId_fkey" FOREIGN KEY ("siguientePartidoId") REFERENCES "partidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets_partido" ADD CONSTRAINT "sets_partido_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "jugadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "etapas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_ranking" ADD CONSTRAINT "movimientos_ranking_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importaciones_padron" ADD CONSTRAINT "importaciones_padron_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracciones_resultado" ADD CONSTRAINT "extracciones_resultado_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
