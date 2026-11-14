import { EstadoProcesoIA, MotivoMovimiento, type ImportacionPadron, type Prisma } from '@prisma/client';
import type { DatosConfirmarImportacion, FilaExtraida, Importacion, ResultadoConfirmacion } from '@setpoint/shared';
import { DEL_PADRON, DEL_PADRON_ACTIVOS } from '../../../lib/padron';
import { organizacionAdministrada } from '../../../lib/permisos';
import { prisma } from '../../../lib/prisma';
import { ErrorHttp } from '../../../middleware/errores';
import { numerosDeFila, type Auditoria } from './auditar';
import { contarFilas, planificarConfirmacion, yaExiste, type MovimientoAImportar } from './confirmacion';
import { leerPlanilla } from './leer-planilla';
import { procesarPlanilla } from './procesar-planilla';

// Lo que se guarda en ImportacionPadron.resumen. La confirmación lee la propuesta de acá,
// nunca del cliente.
type Resumen = {
  // La categoría elegida al subir o detectada en la planilla, si ya existe en el circuito.
  categoriaId: number | null;
  // La detectada que el circuito todavía no tiene: se crea al confirmar (decisión 011).
  categoriaNueva: string | null;
  // Los torneos del calendario de la planilla, en el orden de sus columnas.
  etapas: string[];
  propuesta: FilaExtraida[];
  // Texto original de cada fila de la propuesta, por número de fila.
  textos: Record<number, string>;
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

// Las etapas de la planilla, o las de los casilleros en una importación de antes de la v2.
function etapasDe(resumen: Partial<Resumen>) {
  return resumen.etapas ?? [...new Set((resumen.propuesta ?? []).flatMap((f) => f.casilleros.map((c) => c.etapa)))];
}

const conPuntos = (propuesta: FilaExtraida[]) => propuesta.some((f) => f.casilleros.some((c) => c.puntos > 0));

// Lo que se crea en el circuito al confirmar: lo que la planilla trae y el circuito no tiene. Se
// calcula al consultar, porque la organización pudo cargarlo a mano mientras tanto.
async function loQueSeCrea(organizacionId: number, resumen: Partial<Resumen>): Promise<Importacion['crea']> {
  const [organizacion, etapas] = await Promise.all([
    prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId }, select: { usaRanking: true } }),
    prisma.etapa.findMany({ where: { organizacionId, activa: true }, select: { nombre: true } }),
  ]);
  const activas = new Set(etapas.map((e) => e.nombre.toLowerCase()));
  return {
    categoria: resumen.categoriaId ? null : (resumen.categoriaNueva ?? null),
    etapas: etapasDe(resumen).filter((e) => !activas.has(e.toLowerCase())),
    // Una organización que importa puntos tiene un ranking (decisión 098).
    ranking: !organizacion.usaRanking && conPuntos(resumen.propuesta ?? []),
  };
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
    categoria: categoria?.nombre ?? resumen.categoriaNueva ?? null,
    crea: await loQueSeCrea(importacion.organizacionId, resumen),
    creadoEn: importacion.creadoEn.toISOString(),
    confirmadaEn: importacion.confirmadaEn?.toISOString() ?? null,
    error: resumen.error ?? null,
    propuesta: (resumen.propuesta ?? []).map((f) => ({ ...f, enLaPlanilla: resumen.textos?.[f.fila] ?? '' })),
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

const categoriaDelCircuito = (organizacionId: number, nombre: string) =>
  prisma.categoria.findFirst({
    where: { organizacionId, activa: true, suelta: false, nombre: { equals: nombre.trim(), mode: 'insensitive' } },
    select: { id: true },
  });

async function idDeCategoria(organizacionId: number, nombre: string) {
  const categoria = await categoriaDelCircuito(organizacionId, nombre);
  if (!categoria) throw new ErrorHttp(400, 'CATEGORIA_NO_ENCONTRADA');
  return categoria.id;
}

// Crea en el circuito las categorías o etapas que faltan, o reactiva las que se habían quitado: el
// nombre es único aunque esté inactiva. Como en Tu circuito, una categoría de torneo suelto con el
// mismo nombre pasa a ser del circuito. Devuelve el id de cada una, por nombre en minúscula.
async function asegurarEnElCircuito(
  tx: Prisma.TransactionClient,
  modelo: 'categoria' | 'etapa',
  organizacionId: number,
  nombres: string[],
) {
  // Categoria y Etapa tienen las mismas columnas: se opera sobre las dos con el mismo delegado.
  const delegado = (modelo === 'categoria' ? tx.categoria : tx.etapa) as Prisma.CategoriaDelegate;
  const existentes = await delegado.findMany({ where: { organizacionId } });
  const porNombre = new Map(existentes.map((fila) => [fila.nombre.toLowerCase(), fila]));
  let orden = Math.max(-1, ...existentes.filter((f) => f.activa).map((f) => f.orden)) + 1;
  const delCircuito = modelo === 'categoria' ? { suelta: false } : {};

  const ids = new Map<string, number>();
  for (const nombre of nombres) {
    const clave = nombre.toLowerCase();
    const existente = porNombre.get(clave);
    if (existente?.activa && !existente.suelta) {
      ids.set(clave, existente.id);
    } else if (existente) {
      await delegado.update({ where: { id: existente.id }, data: { activa: true, orden: orden++, ...delCircuito } });
      ids.set(clave, existente.id);
    } else {
      const { id } = await delegado.create({ data: { organizacionId, nombre, orden: orden++ }, select: { id: true } });
      ids.set(clave, id);
    }
  }
  return ids;
}

export type ArchivoSubido = { nombre: string; contenido: Buffer };

// Sube la planilla y la procesa con IA. La importación queda PROCESADO, lista para revisar,
// o ERROR con el motivo. Un fallo de la IA o de la red no se propaga: se guarda.
// Sin categoría elegida, se toma la que diga la planilla (decisión 011).
export async function crearImportacion(slug: string, usuarioId: number, archivo: ArchivoSubido, categoria: string | null) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  let categoriaId = categoria ? await idDeCategoria(organizacionId, categoria) : null;

  const importacion = await prisma.importacionPadron.create({
    data: { organizacionId, archivoNombre: archivo.nombre, resumen: { categoriaId } },
  });

  let datos: Prisma.ImportacionPadronUpdateInput;
  try {
    const [padron, etapas, categorias] = await Promise.all([
      prisma.jugador.findMany({ where: { organizacionId, ...DEL_PADRON_ACTIVOS }, select: { id: true, nombre: true, apellido: true } }),
      prisma.etapa.findMany({ where: { organizacionId, activa: true }, orderBy: { orden: 'asc' }, select: { nombre: true } }),
      prisma.categoria.findMany({ where: { organizacionId, activa: true, suelta: false }, orderBy: { orden: 'asc' }, select: { nombre: true } }),
    ]);

    // Sin etapas ni categorías, la IA las detecta en la planilla y se crean al confirmar (decisión 011).
    const resultado = await procesarPlanilla(archivo.contenido, {
      archivo: archivo.nombre,
      padron,
      etapas: etapas.map((e) => e.nombre),
      categorias: categorias.map((c) => c.nombre),
      hoy: new Date(),
    });

    // La detectada se usa si no se eligió una al subir: la que ya existe, o una nueva.
    const detectada = resultado.ok ? resultado.respuesta.categoria?.trim() || null : null;
    let categoriaNueva: string | null = null;
    if (categoriaId === null && detectada) {
      categoriaId = (await categoriaDelCircuito(organizacionId, detectada))?.id ?? null;
      if (categoriaId === null) categoriaNueva = detectada;
    }

    const propuesta = resultado.ok ? resultado.respuesta.jugadores : [];
    const auditoria = resultado.auditoria ?? { globales: [], porFila: [] };
    const error = resultado.ok
      ? resultado.respuesta.esPlanillaDeJugadores ? null : `No parece una planilla de jugadores: ${resultado.respuesta.motivo ?? 'sin motivo'}`
      : resultado.error;

    // Las celdas de texto de la fila, sin los números: el nombre como lo escribió la organización.
    const filasPropuestas = new Set(propuesta.map((j) => j.fila));
    const textos = Object.fromEntries(
      leerPlanilla(archivo.contenido)
        .filter((f) => filasPropuestas.has(f.fila))
        .map((f) => [
          f.fila,
          f.celdas.filter((c): c is string => typeof c === 'string' && numerosDeFila([c]).length === 0).join(' · '),
        ]),
    );

    const resumen: Resumen = {
      categoriaId,
      categoriaNueva,
      etapas: resultado.ok ? resultado.respuesta.etapas : [],
      propuesta,
      textos,
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
    const motivo = `No se pudo procesar la planilla: ${err instanceof Error ? err.message : String(err)}`;
    datos = { resumen: { categoriaId, error: motivo }, estado: EstadoProcesoIA.ERROR };
  }

  return vista(await prisma.importacionPadron.update({ where: { id: importacion.id }, data: datos }));
}

export async function obtenerImportacion(slug: string, usuarioId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  return vista(await importacionDe(organizacionId, id));
}

// Aplica las decisiones de la organización en una sola transacción: crea en el circuito la
// categoría y los torneos del calendario que la planilla trae y no tenía (decisión 011), enciende el
// ranking si hay puntos (decisión 098), crea los jugadores nuevos, carga un movimiento por casillero
// con puntos y deja la importación CONFIRMADO. Si algo falla, no queda nada creado.
export async function confirmarImportacion(
  slug: string,
  usuarioId: number,
  id: number,
  { decisiones, categoria: categoriaElegida }: DatosConfirmarImportacion,
): Promise<ResultadoConfirmacion> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const importacion = await importacionDe(organizacionId, id);
  if (importacion.estado !== EstadoProcesoIA.PROCESADO) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  const resumen = resumenDe(importacion);
  const { propuesta = [] } = resumen;

  // La categoría: la que se eligió o detectó al subir, y si la planilla no la decía, la que se
  // eligió al revisar. La que ya existía pudo darse de baja entre la subida y la confirmación.
  let nombreCategoria = resumen.categoriaNueva ?? categoriaElegida?.trim() ?? null;
  if (resumen.categoriaId) {
    const categoria = await prisma.categoria.findFirst({
      where: { id: resumen.categoriaId, organizacionId, activa: true, suelta: false },
      select: { nombre: true },
    });
    if (!categoria) throw new ErrorHttp(409, 'CATEGORIA_NO_ENCONTRADA');
    nombreCategoria = categoria.nombre;
  }
  if (!nombreCategoria) throw new ErrorHttp(400, 'DATOS_INVALIDOS', { categoria: 'Elegí la categoría de la planilla' });

  const jugadores = await prisma.jugador.findMany({ where: { organizacionId, ...DEL_PADRON }, select: { id: true } });
  const plan = planificarConfirmacion(propuesta, decisiones, new Set(jugadores.map((j) => j.id)));

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

    const categoriaId = (await asegurarEnElCircuito(tx, 'categoria', organizacionId, [nombreCategoria])).get(
      nombreCategoria.toLowerCase(),
    )!;
    const etapaIds = await asegurarEnElCircuito(tx, 'etapa', organizacionId, etapasDe(resumen));
    const conEtapa = (m: MovimientoAImportar) => {
      const etapaId = etapaIds.get(m.etapa.toLowerCase());
      if (etapaId === undefined) throw new ErrorHttp(409, 'ETAPA_NO_ENCONTRADA');
      return { etapaId, puntos: m.puntos, fecha: m.fecha, detalle: m.detalle };
    };

    // Una organización que importa puntos tiene un ranking: dejarlo apagado escondería lo que acaba
    // de cargar (decisión 098).
    const hayPuntos = [...plan.crear, ...plan.vincular].some((j) => j.movimientos.length > 0);
    if (hayPuntos) await tx.organizacion.update({ where: { id: organizacionId }, data: { usaRanking: true } });

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
      for (const m of movimientos.map(conEtapa)) {
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
