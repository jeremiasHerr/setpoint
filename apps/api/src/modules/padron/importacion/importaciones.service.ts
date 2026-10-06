import { EstadoProcesoIA, MotivoMovimiento, type ImportacionPadron, type Prisma } from '@prisma/client';
import type { DatosConfirmarImportacion, FilaPropuesta, Importacion, ResultadoConfirmacion } from '@setpoint/shared';
import { organizacionAdministrada } from '../../../lib/permisos';
import { prisma } from '../../../lib/prisma';
import { ErrorHttp } from '../../../middleware/errores';
import type { Auditoria } from './auditar';
import { contarFilas, planificarConfirmacion, yaExiste } from './confirmacion';
import { procesarPlanilla } from './procesar-planilla';

// Lo que se guarda en ImportacionPadron.resumen. La confirmación lee la propuesta de acá,
// nunca del cliente.
type Resumen = {
  categoriaId: number;
  propuesta: FilaPropuesta[];
  auditoria: Auditoria;
  modelo: string;
  versionPrompt: string;
  tokens: { entrada: number; salida: number };
  intentos: number;
  conteos: Importacion['conteos'];
  error: string | null;
};

const SIN_CONTEOS = { existentes: 0, nuevos: 0, dudosos: 0, conProblemas: 0 };

function resumenDe(importacion: ImportacionPadron): Partial<Resumen> {
  return (importacion.resumen ?? {}) as Partial<Resumen>;
}

async function vista(importacion: ImportacionPadron): Promise<Importacion> {
  const resumen = resumenDe(importacion);
  const categoria = resumen.categoriaId
    ? await prisma.categoria.findUnique({ where: { id: resumen.categoriaId }, select: { nombre: true } })
    : null;

  return {
    id: importacion.id,
    archivoNombre: importacion.archivoNombre,
    estado: importacion.estado,
    categoria: categoria?.nombre ?? null,
    creadoEn: importacion.creadoEn.toISOString(),
    confirmadaEn: importacion.confirmadaEn?.toISOString() ?? null,
    error: resumen.error ?? null,
    propuesta: resumen.propuesta ?? [],
    problemas: [...(resumen.auditoria?.globales ?? []), ...(resumen.auditoria?.porFila ?? [])],
    conteos: resumen.conteos ?? SIN_CONTEOS,
  };
}

async function importacionDe(organizacionId: number, id: number) {
  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const importacion = Number.isInteger(id)
    ? await prisma.importacionPadron.findFirst({ where: { id, organizacionId } })
    : null;
  if (!importacion) throw new ErrorHttp(404, 'IMPORTACION_NO_ENCONTRADA');
  return importacion;
}

async function idDeCategoria(organizacionId: number, nombre: string) {
  const categoria = await prisma.categoria.findFirst({
    where: { organizacionId, activa: true, nombre: { equals: nombre, mode: 'insensitive' } },
    select: { id: true },
  });
  if (!categoria) throw new ErrorHttp(400, 'CATEGORIA_NO_ENCONTRADA');
  return categoria.id;
}

export type ArchivoSubido = { nombre: string; contenido: Buffer };

// Sube la planilla y la procesa con IA. La importación queda PROCESADO, lista para revisar,
// o ERROR con el motivo. Un fallo de la IA o de la red no se propaga: se guarda.
export async function crearImportacion(slug: string, usuarioId: number, archivo: ArchivoSubido, categoria: string) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const categoriaId = await idDeCategoria(organizacionId, categoria);

  const importacion = await prisma.importacionPadron.create({
    data: { organizacionId, archivoNombre: archivo.nombre, resumen: { categoriaId } },
  });

  let datos: Prisma.ImportacionPadronUpdateInput;
  try {
    const [padron, etapas] = await Promise.all([
      prisma.jugador.findMany({ where: { organizacionId, activo: true }, select: { id: true, nombre: true, apellido: true } }),
      prisma.etapa.findMany({ where: { organizacionId, activa: true }, orderBy: { orden: 'asc' }, select: { nombre: true } }),
    ]);
    if (etapas.length === 0) throw new ErrorHttp(409, 'SIN_ETAPAS');

    const resultado = await procesarPlanilla(archivo.contenido, {
      padron,
      etapas: etapas.map((e) => e.nombre),
      hoy: new Date(),
    });

    const propuesta = resultado.ok ? resultado.respuesta.jugadores : [];
    const auditoria = resultado.auditoria ?? { globales: [], porFila: [] };
    const error = resultado.ok
      ? resultado.respuesta.esPlanillaDeJugadores ? null : `No parece una planilla de jugadores: ${resultado.respuesta.motivo ?? 'sin motivo'}`
      : resultado.error;

    const resumen: Resumen = {
      categoriaId,
      propuesta,
      auditoria,
      modelo: resultado.modelo,
      versionPrompt: resultado.versionPrompt,
      tokens: resultado.tokens,
      intentos: resultado.intentos,
      conteos: contarFilas(propuesta, auditoria.porFila),
      error,
    };
    datos = {
      respuestaCruda: resultado.crudos,
      resumen,
      estado: error === null ? EstadoProcesoIA.PROCESADO : EstadoProcesoIA.ERROR,
    };
  } catch (err) {
    console.error(err);
    const motivo = err instanceof ErrorHttp && err.codigo === 'SIN_ETAPAS'
      ? 'El circuito no tiene etapas configuradas: no hay casilleros donde cargar los puntos'
      : `No se pudo procesar la planilla: ${err instanceof Error ? err.message : String(err)}`;
    datos = { resumen: { categoriaId, error: motivo }, estado: EstadoProcesoIA.ERROR };
  }

  return vista(await prisma.importacionPadron.update({ where: { id: importacion.id }, data: datos }));
}

export async function obtenerImportacion(slug: string, usuarioId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  return vista(await importacionDe(organizacionId, id));
}

// Aplica las decisiones de la organización en una sola transacción: crea los jugadores nuevos,
// carga un movimiento por casillero con puntos y deja la importación CONFIRMADO.
export async function confirmarImportacion(
  slug: string,
  usuarioId: number,
  id: number,
  { decisiones }: DatosConfirmarImportacion,
): Promise<ResultadoConfirmacion> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const importacion = await importacionDe(organizacionId, id);
  if (importacion.estado !== EstadoProcesoIA.PROCESADO) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  const { categoriaId, propuesta = [] } = resumenDe(importacion);
  if (!categoriaId) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  // La categoría pudo darse de baja entre la subida y la confirmación.
  const categoria = await prisma.categoria.findFirst({ where: { id: categoriaId, organizacionId, activa: true } });
  if (!categoria) throw new ErrorHttp(409, 'CATEGORIA_NO_ENCONTRADA');

  const [jugadores, etapas] = await Promise.all([
    prisma.jugador.findMany({ where: { organizacionId }, select: { id: true } }),
    prisma.etapa.findMany({ where: { organizacionId }, select: { id: true, nombre: true } }),
  ]);
  const plan = planificarConfirmacion(
    propuesta,
    decisiones,
    new Set(jugadores.map((j) => j.id)),
    new Map(etapas.map((e) => [e.nombre, e.id])),
  );

  return prisma.$transaction(async (tx) => {
    // Con el estado en la condición, dos confirmaciones simultáneas no pasan las dos.
    const tomada = await tx.importacionPadron.updateMany({
      where: { id: importacion.id, estado: EstadoProcesoIA.PROCESADO },
      data: { estado: EstadoProcesoIA.CONFIRMADO, confirmadaEn: new Date() },
    });
    if (tomada.count === 0) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

    const resultado: ResultadoConfirmacion = {
      creados: plan.crear.length,
      vinculados: plan.vincular.length,
      excluidos: plan.excluidos,
      movimientosCreados: 0,
      movimientosSalteados: 0,
    };

    // En secuencia: una transacción interactiva usa una sola conexión.
    const nuevos = [];
    for (const j of plan.crear) {
      const { id: jugadorId } = await tx.jugador.create({
        data: { organizacionId, categoriaId, nombre: j.nombre, apellido: j.apellido },
        select: { id: true },
      });
      nuevos.push({ jugadorId, movimientos: j.movimientos });
    }

    const existentes = await tx.movimientoRanking.findMany({
      where: { organizacionId, categoriaId, jugadorId: { in: plan.vincular.map((v) => v.jugadorId) } },
      select: { jugadorId: true, etapaId: true, puntos: true, fecha: true },
    });

    const aCrear: Prisma.MovimientoRankingCreateManyInput[] = [];
    for (const { jugadorId, movimientos } of [...plan.vincular, ...nuevos]) {
      const delJugador = existentes.filter((e) => e.jugadorId === jugadorId);
      for (const m of movimientos) {
        if (yaExiste(m, delJugador)) {
          resultado.movimientosSalteados++;
          continue;
        }
        aCrear.push({ organizacionId, jugadorId, categoriaId, motivo: MotivoMovimiento.IMPORTACION_INICIAL, ...m });
      }
    }
    resultado.movimientosCreados = (await tx.movimientoRanking.createMany({ data: aCrear })).count;

    return resultado;
  }, { timeout: 20_000 });
}

export async function descartarImportacion(slug: string, usuarioId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const importacion = await importacionDe(organizacionId, id);

  const descartable: EstadoProcesoIA[] = [EstadoProcesoIA.PROCESADO, EstadoProcesoIA.ERROR];
  if (!descartable.includes(importacion.estado)) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  return vista(
    await prisma.importacionPadron.update({ where: { id: importacion.id }, data: { estado: EstadoProcesoIA.DESCARTADO } }),
  );
}
