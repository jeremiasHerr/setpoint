import { EstadoProcesoIA, MotivoMovimiento, type Prisma } from '@prisma/client';
import type {
  DatosConfirmarImportacion,
  FilaExtraida,
  HojaImportada,
  Importacion,
  ResultadoConfirmacion,
} from '@setpoint/shared';
import { DEL_PADRON, DEL_PADRON_ACTIVOS } from '../../../lib/padron';
import { organizacionAdministrada } from '../../../lib/permisos';
import { prisma } from '../../../lib/prisma';
import { ErrorHttp } from '../../../middleware/errores';
import { numerosDeFila, type Auditoria } from './auditar';
import { contarFilas, planificarConfirmacion, yaExiste, type MovimientoAImportar, type PlanConfirmacion } from './confirmacion';
import { controlarEntreHojas } from './entre-hojas';
import { leerHojas, type FilaPlanilla } from './leer-planilla';
import { procesarHoja, type ContextoImportacion } from './procesar-planilla';

// La importación es un lote de archivos y hojas (decisión 012). Lo que se guarda de cada hoja en
// HojaImportacion.resumen: la confirmación lee la propuesta de acá, nunca del cliente.
type ResumenHoja = {
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

type HojaLeida = { id: number; archivoNombre: string; hoja: string; estado: EstadoProcesoIA; resumen: Partial<ResumenHoja> };

const CON_HOJAS = { hojas: { orderBy: { orden: 'asc' } } } satisfies Prisma.ImportacionPadronInclude;
type ImportacionConHojas = Prisma.ImportacionPadronGetPayload<{ include: typeof CON_HOJAS }>;

const SIN_CONTEOS = { existentes: 0, nuevos: 0, dudosos: 0, conProblemas: 0 };

// Las importaciones de antes de la decisión 012 guardan su única planilla en el resumen del lote:
// se leen como una hoja con id 0.
function hojasDe(importacion: ImportacionConHojas): HojaLeida[] {
  if (importacion.hojas.length > 0) {
    return importacion.hojas.map((h) => ({
      id: h.id,
      archivoNombre: h.archivoNombre,
      hoja: h.hoja,
      estado: h.estado,
      resumen: (h.resumen ?? {}) as Partial<ResumenHoja>,
    }));
  }
  const resumen = (importacion.resumen ?? {}) as Partial<ResumenHoja>;
  const estado = resumen.error ? EstadoProcesoIA.ERROR : importacion.estado;
  return [{ id: 0, archivoNombre: importacion.archivoNombre, hoja: '', estado, resumen }];
}

const leida = (h: HojaLeida) => h.estado !== EstadoProcesoIA.ERROR && h.estado !== EstadoProcesoIA.PENDIENTE;

// Las etapas de la planilla, o las de los casilleros en una importación de antes de la v2.
function etapasDe(resumen: Partial<ResumenHoja>) {
  return resumen.etapas ?? [...new Set((resumen.propuesta ?? []).flatMap((f) => f.casilleros.map((c) => c.etapa)))];
}

const sinRepetir = (nombres: string[]) => {
  const vistos = new Set<string>();
  return nombres.filter((n) => !vistos.has(n.toLowerCase()) && vistos.add(n.toLowerCase()));
};

const conPuntos = (propuesta: FilaExtraida[]) => propuesta.some((f) => f.casilleros.some((c) => c.puntos > 0));

const sumar = (conteos: Importacion['conteos'][]) =>
  conteos.reduce(
    (total, c) => ({
      existentes: total.existentes + c.existentes,
      nuevos: total.nuevos + c.nuevos,
      dudosos: total.dudosos + c.dudosos,
      conProblemas: total.conProblemas + c.conProblemas,
    }),
    SIN_CONTEOS,
  );

// Lo que se crea en el circuito al confirmar: lo que las planillas traen y el circuito no tiene. Se
// calcula al consultar, porque la organización pudo cargarlo a mano mientras tanto.
async function loQueSeCrea(organizacionId: number, hojas: HojaLeida[]): Promise<Importacion['crea']> {
  const [organizacion, etapas] = await Promise.all([
    prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId }, select: { usaRanking: true } }),
    prisma.etapa.findMany({ where: { organizacionId, activa: true }, select: { nombre: true } }),
  ]);
  const activas = new Set(etapas.map((e) => e.nombre.toLowerCase()));
  return {
    categorias: sinRepetir(hojas.flatMap((h) => (h.resumen.categoriaId ? [] : h.resumen.categoriaNueva ?? []))),
    etapas: sinRepetir(hojas.flatMap((h) => etapasDe(h.resumen))).filter((e) => !activas.has(e.toLowerCase())),
    // Una organización que importa puntos tiene un ranking (decisión 098).
    ranking: !organizacion.usaRanking && hojas.some((h) => conPuntos(h.resumen.propuesta ?? [])),
  };
}

async function vista(importacion: ImportacionConHojas): Promise<Importacion> {
  const hojas = hojasDe(importacion);
  const idsCategorias = hojas.flatMap((h) => (h.resumen.categoriaId ? [h.resumen.categoriaId] : []));
  const categorias = await prisma.categoria.findMany({ where: { id: { in: idsCategorias } }, select: { id: true, nombre: true } });
  const nombreDe = new Map(categorias.map((c) => [c.id, c.nombre]));
  const leidas = hojas.filter(leida);

  const vistas: HojaImportada[] = hojas.map(({ id, archivoNombre, hoja, estado, resumen }) => ({
    id,
    archivoNombre,
    hoja,
    estado,
    error: resumen.error ?? null,
    categoria: (resumen.categoriaId ? nombreDe.get(resumen.categoriaId) : null) ?? resumen.categoriaNueva ?? null,
    propuesta: (resumen.propuesta ?? []).map((f) => ({ ...f, enLaPlanilla: resumen.textos?.[f.fila] ?? '' })),
    problemas: [...(resumen.auditoria?.globales ?? []), ...(resumen.auditoria?.porFila ?? [])],
    conteos: resumen.conteos ?? SIN_CONTEOS,
  }));

  return {
    id: importacion.id,
    archivoNombre: importacion.archivoNombre,
    estado: importacion.estado,
    creadoEn: importacion.creadoEn.toISOString(),
    confirmadaEn: importacion.confirmadaEn?.toISOString() ?? null,
    error:
      importacion.estado === EstadoProcesoIA.ERROR
        ? (hojas.length === 1 ? hojas[0].resumen.error : null) ?? 'No pudimos leer ninguna de las planillas'
        : null,
    hojas: vistas,
    conteos: sumar(leidas.map((h) => h.resumen.conteos ?? SIN_CONTEOS)),
    crea: await loQueSeCrea(importacion.organizacionId, leidas),
  };
}

async function importacionDe(organizacionId: number, id: number) {
  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const importacion = Number.isInteger(id)
    ? await prisma.importacionPadron.findFirst({ where: { id, organizacionId }, include: CON_HOJAS })
    : null;
  if (!importacion) throw new ErrorHttp(404, 'IMPORTACION_NO_ENCONTRADA');
  return importacion;
}

const categoriaDelCircuito = (organizacionId: number, nombre: string) =>
  prisma.categoria.findFirst({
    where: { organizacionId, activa: true, suelta: false, nombre: { equals: nombre.trim(), mode: 'insensitive' } },
    select: { id: true, nombre: true },
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

type HojaPorProcesar = { archivo: ArchivoSubido; hoja: { nombre: string; filas: FilaPlanilla[] } | null; error: string | null };

type HojaProcesada = { archivoNombre: string; hoja: string; resumen: Partial<ResumenHoja>; crudos: string[] | null };

// Las hojas con datos de cada archivo. Un archivo que no se puede abrir o no tiene datos queda como
// una hoja con error: no frena a los demás.
function hojasPorProcesar(archivos: ArchivoSubido[]): HojaPorProcesar[] {
  return archivos.flatMap((archivo): HojaPorProcesar[] => {
    try {
      const hojas = leerHojas(archivo.contenido);
      if (hojas.length === 0) return [{ archivo, hoja: null, error: 'El archivo no tiene datos' }];
      return hojas.map((hoja) => ({ archivo, hoja, error: null }));
    } catch {
      return [{ archivo, hoja: null, error: 'No pudimos abrir el archivo' }];
    }
  });
}

// Una hoja con IA: la categoría, la propuesta, la auditoría y los textos de cada fila. Un fallo de
// la IA o de la red no se propaga: queda como el error de la hoja.
async function procesarUnaHoja(
  organizacionId: number,
  { archivo, hoja }: { archivo: ArchivoSubido; hoja: { nombre: string; filas: FilaPlanilla[] } },
  contexto: Omit<ContextoImportacion, 'archivo'>,
  categoriaElegida: number | null,
): Promise<HojaProcesada> {
  try {
    // Sin etapas ni categorías, la IA las detecta en la planilla y se crean al confirmar (decisión 011).
    const resultado = await procesarHoja(hoja, { ...contexto, archivo: archivo.nombre });

    // La detectada se usa si no se eligió una al subir: la que ya existe, o una nueva.
    let categoriaId = categoriaElegida;
    let categoriaNueva: string | null = null;
    const detectada = resultado.ok ? resultado.respuesta.categoria?.trim() || null : null;
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
      hoja.filas
        .filter((f) => filasPropuestas.has(f.fila))
        .map((f) => [
          f.fila,
          f.celdas.filter((c): c is string => typeof c === 'string' && numerosDeFila([c]).length === 0).join(' · '),
        ]),
    );

    return {
      archivoNombre: archivo.nombre,
      hoja: hoja.nombre,
      crudos: resultado.crudos,
      resumen: {
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
      },
    };
  } catch (err) {
    console.error(err);
    const error = `No se pudo procesar la planilla: ${err instanceof Error ? err.message : String(err)}`;
    return { archivoNombre: archivo.nombre, hoja: hoja.nombre, crudos: null, resumen: { categoriaId: categoriaElegida, error } };
  }
}

// Sube las planillas y las procesa con IA, cada hoja por separado y en paralelo (decisión 012). El
// lote queda PROCESADO, listo para revisar, si se pudo leer al menos una hoja; si no, ERROR.
// La categoría elegida al subir vale solo si el lote es una sola hoja; si no, se toma la que diga
// cada planilla (decisión 011).
export async function crearImportacion(slug: string, usuarioId: number, archivos: ArchivoSubido[], categoria: string | null) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const categoriaElegida = categoria ? await idDeCategoria(organizacionId, categoria) : null;

  const importacion = await prisma.importacionPadron.create({
    data: {
      organizacionId,
      archivoNombre: archivos.length === 1 ? archivos[0].nombre : `${archivos.length} archivos`,
    },
  });

  const [padron, etapas, categorias] = await Promise.all([
    prisma.jugador.findMany({ where: { organizacionId, ...DEL_PADRON_ACTIVOS }, select: { id: true, nombre: true, apellido: true } }),
    prisma.etapa.findMany({ where: { organizacionId, activa: true }, orderBy: { orden: 'asc' }, select: { nombre: true } }),
    prisma.categoria.findMany({ where: { organizacionId, activa: true, suelta: false }, orderBy: { orden: 'asc' }, select: { nombre: true } }),
  ]);
  const contexto = { padron, etapas: etapas.map((e) => e.nombre), categorias: categorias.map((c) => c.nombre), hoy: new Date() };

  const porProcesar = hojasPorProcesar(archivos);
  const fija = porProcesar.length === 1 ? categoriaElegida : null;
  const procesadas = await Promise.all(
    porProcesar.map(({ archivo, hoja, error }): Promise<HojaProcesada> | HojaProcesada =>
      hoja
        ? procesarUnaHoja(organizacionId, { archivo, hoja }, contexto, fija)
        : { archivoNombre: archivo.nombre, hoja: '', crudos: null, resumen: { categoriaId: null, error } },
    ),
  );

  // Un jugador va en una sola categoría: si aparece en dos hojas, va a revisión en las dos.
  const nombreCategoria = new Map((await prisma.categoria.findMany({ where: { organizacionId }, select: { id: true, nombre: true } })).map((c) => [c.id, c.nombre]));
  const conPropuesta = procesadas.flatMap((p, i) =>
    p.resumen.error ? [] : [{ id: i, propuesta: p.resumen.propuesta ?? [], categoria: (p.resumen.categoriaId ? nombreCategoria.get(p.resumen.categoriaId) : null) ?? p.resumen.categoriaNueva ?? p.hoja }],
  );
  for (const [i, problemas] of controlarEntreHojas(conPropuesta)) {
    const { resumen } = procesadas[i];
    resumen.auditoria = { globales: resumen.auditoria?.globales ?? [], porFila: [...(resumen.auditoria?.porFila ?? []), ...problemas] };
    resumen.conteos = contarFilas(resumen.propuesta ?? [], resumen.auditoria.porFila);
  }

  const algunaLeida = procesadas.some((p) => !p.resumen.error);
  await prisma.$transaction([
    prisma.hojaImportacion.createMany({
      data: procesadas.map((p, orden) => ({
        importacionId: importacion.id,
        orden,
        archivoNombre: p.archivoNombre,
        hoja: p.hoja,
        estado: p.resumen.error ? EstadoProcesoIA.ERROR : EstadoProcesoIA.PROCESADO,
        resumen: p.resumen as Prisma.InputJsonValue,
        respuestaCruda: p.crudos ?? undefined,
      })),
    }),
    prisma.importacionPadron.update({
      where: { id: importacion.id },
      data: { estado: algunaLeida ? EstadoProcesoIA.PROCESADO : EstadoProcesoIA.ERROR },
    }),
  ]);

  return vista(await importacionDe(organizacionId, importacion.id));
}

export async function obtenerImportacion(slug: string, usuarioId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  return vista(await importacionDe(organizacionId, id));
}

// Aplica las decisiones de la organización al lote entero en una sola transacción: crea en el
// circuito las categorías y los torneos del calendario que las planillas traen y no tenía (decisión
// 011), enciende el ranking si hay puntos (decisión 098), crea los jugadores nuevos, carga un
// movimiento por casillero con puntos y deja la importación CONFIRMADO. Las hojas que no se pudieron
// leer quedan afuera. Si algo falla, no queda nada creado.
export async function confirmarImportacion(
  slug: string,
  usuarioId: number,
  id: number,
  { decisiones, categorias: elegidas = {} }: DatosConfirmarImportacion,
): Promise<ResultadoConfirmacion> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const importacion = await importacionDe(organizacionId, id);
  if (importacion.estado !== EstadoProcesoIA.PROCESADO) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  const hojas = hojasDe(importacion).filter(leida);
  const idsHojas = new Set(hojas.map((h) => h.id));
  if (decisiones.some((d) => !idsHojas.has(d.hoja))) {
    throw new ErrorHttp(400, 'DATOS_INVALIDOS', { decisiones: 'Hay decisiones para una hoja que no está en la importación' });
  }

  // La categoría de cada hoja: la que se eligió o detectó al subir, y si la planilla no la decía, la
  // que se eligió al revisar. La que ya existía pudo darse de baja entre la subida y la confirmación.
  const categoriaDe = new Map<number, string>();
  const faltan: Record<string, string> = {};
  for (const hoja of hojas) {
    let nombre = hoja.resumen.categoriaNueva ?? elegidas[String(hoja.id)]?.trim() ?? null;
    if (hoja.resumen.categoriaId) {
      const categoria = await prisma.categoria.findFirst({
        where: { id: hoja.resumen.categoriaId, organizacionId, activa: true, suelta: false },
        select: { nombre: true },
      });
      if (!categoria) throw new ErrorHttp(409, 'CATEGORIA_NO_ENCONTRADA');
      nombre = categoria.nombre;
    }
    if (nombre) categoriaDe.set(hoja.id, nombre);
    else faltan[`categorias.${hoja.id}`] = 'Elegí la categoría de la planilla';
  }
  if (Object.keys(faltan).length > 0) throw new ErrorHttp(400, 'DATOS_INVALIDOS', faltan);

  const jugadores = await prisma.jugador.findMany({ where: { organizacionId, ...DEL_PADRON }, select: { id: true } });
  const idsJugadores = new Set(jugadores.map((j) => j.id));
  const planes: { hoja: HojaLeida; plan: PlanConfirmacion }[] = hojas.map((hoja) => ({
    hoja,
    plan: planificarConfirmacion(hoja.resumen.propuesta ?? [], decisiones.filter((d) => d.hoja === hoja.id), idsJugadores),
  }));
  // Un jugador del padrón va en una sola categoría: no se vincula desde dos hojas.
  const vinculados = planes.flatMap(({ plan }) => plan.vincular.map((v) => v.jugadorId));
  if (new Set(vinculados).size < vinculados.length) {
    throw new ErrorHttp(400, 'DATOS_INVALIDOS', { decisiones: 'Un mismo jugador está vinculado en dos hojas' });
  }

  return prisma.$transaction(async (tx) => {
    // Con el estado en la condición, dos confirmaciones simultáneas no pasan las dos.
    const tomada = await tx.importacionPadron.updateMany({
      where: { id: importacion.id, estado: EstadoProcesoIA.PROCESADO },
      data: { estado: EstadoProcesoIA.CONFIRMADO, confirmadaEn: new Date() },
    });
    if (tomada.count === 0) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');
    await tx.hojaImportacion.updateMany({
      where: { importacionId: importacion.id, estado: EstadoProcesoIA.PROCESADO },
      data: { estado: EstadoProcesoIA.CONFIRMADO },
    });

    const categoriaIds = await asegurarEnElCircuito(tx, 'categoria', organizacionId, sinRepetir([...categoriaDe.values()]));
    const etapaIds = await asegurarEnElCircuito(tx, 'etapa', organizacionId, sinRepetir(hojas.flatMap((h) => etapasDe(h.resumen))));
    const conEtapa = (m: MovimientoAImportar) => {
      const etapaId = etapaIds.get(m.etapa.toLowerCase());
      if (etapaId === undefined) throw new ErrorHttp(409, 'ETAPA_NO_ENCONTRADA');
      return { etapaId, puntos: m.puntos, fecha: m.fecha, detalle: m.detalle };
    };

    // Una organización que importa puntos tiene un ranking: dejarlo apagado escondería lo que acaba
    // de cargar (decisión 098).
    const hayPuntos = planes.some(({ plan }) => [...plan.crear, ...plan.vincular].some((j) => j.movimientos.length > 0));
    if (hayPuntos) await tx.organizacion.update({ where: { id: organizacionId }, data: { usaRanking: true } });

    const resultado: ResultadoConfirmacion = {
      creados: 0,
      vinculados: 0,
      excluidos: 0,
      movimientosCreados: 0,
      movimientosSalteados: 0,
    };

    for (const { hoja, plan } of planes) {
      const categoriaId = categoriaIds.get(categoriaDe.get(hoja.id)!.toLowerCase())!;
      resultado.creados += plan.crear.length;
      resultado.vinculados += plan.vincular.length;
      resultado.excluidos += plan.excluidos;

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
      resultado.movimientosCreados += (await tx.movimientoRanking.createMany({ data: aCrear })).count;
    }

    return resultado;
  }, { timeout: 30_000 });
}

export async function descartarImportacion(slug: string, usuarioId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const importacion = await importacionDe(organizacionId, id);

  const descartable: EstadoProcesoIA[] = [EstadoProcesoIA.PROCESADO, EstadoProcesoIA.ERROR];
  if (!descartable.includes(importacion.estado)) throw new ErrorHttp(409, 'IMPORTACION_NO_PENDIENTE');

  await prisma.importacionPadron.update({ where: { id: importacion.id }, data: { estado: EstadoProcesoIA.DESCARTADO } });
  return vista(await importacionDe(organizacionId, importacion.id));
}
