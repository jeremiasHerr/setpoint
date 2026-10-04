import {
  EstadoTorneo,
  type ModoInscripcion,
  type ModoSede,
  type Prisma,
  type TerceroSet,
} from '@prisma/client';
import type { Convocatoria, DatosConvocatoria, EstadoTorneo as ClaveEstado } from '@setpoint/shared';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

// Las claves del contrato son los valores de los enums de Prisma en minúscula.
const aEnum = <T extends string>(valor: string) => valor.toUpperCase() as T;
const aClave = <T extends string>(valor: string) => valor.toLowerCase() as T;

// 'AAAA-MM-DD' <-> DateTime a medianoche UTC, para que la fecha no se corra por zona horaria.
const aFecha = (dia: string | null) => (dia === null ? null : new Date(`${dia}T00:00:00.000Z`));
const aDia = (fecha: Date | null) => (fecha === null ? null : fecha.toISOString().slice(0, 10));

const CON_RELACIONES = {
  categoria: { select: { nombre: true } },
  etapa: { select: { nombre: true } },
  clubSede: { select: { nombre: true } },
} satisfies Prisma.TorneoInclude;

type TorneoConRelaciones = Prisma.TorneoGetPayload<{ include: typeof CON_RELACIONES }>;

// Los torneos de una convocatoria comparten `edicion`. El primero (menor id) la representa.
async function torneosDeLaConvocatoria(organizacionId: number, torneoId: number) {
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({
    where: { id: torneoId, organizacionId },
    select: { id: true, edicion: true },
  });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  return prisma.torneo.findMany({
    where: torneo.edicion === null ? { id: torneo.id } : { organizacionId, edicion: torneo.edicion },
    orderBy: { id: 'asc' },
    include: CON_RELACIONES,
  });
}

function aConvocatoria(torneos: TorneoConRelaciones[]): Convocatoria {
  // Todo lo que no es categoría ni cupo se guarda igual en los torneos de la convocatoria.
  const [t] = torneos;
  return {
    id: t.id,
    estado: aClave<ClaveEstado>(t.estado),
    torneos: torneos.map((x) => ({ id: x.id, categoria: x.categoria.nombre })),

    nombre: t.nombre,
    descripcion: t.descripcion ?? '',
    etapa: t.etapa?.nombre ?? null,
    categorias: torneos.map((x) => ({ categoria: x.categoria.nombre, cupo: x.cupo })),

    precio: t.precio.toNumber(),
    modoInscripcion: aClave(t.modoInscripcion),
    tieneListaEspera: t.tieneListaEspera,
    cierreInscripcion: aDia(t.cierreInscripcion),
    fechaInicio: aDia(t.fechaInicio),

    cantidadGrupos: t.cantidadGrupos,
    clasificanPorGrupo: t.clasificanPorGrupo,
    tieneComplementaria: t.tieneComplementaria,

    setsPorPartido: t.setsPorPartido === 5 ? 5 : 3,
    puntoDeOro: t.puntoDeOro,
    terceroSet: aClave(t.terceroSet),
    gamesPorSet: t.gamesPorSet,
    puntosTieBreak: t.puntosTieBreak,
    puntosSuperTieBreak: t.puntosSuperTieBreak,

    plazoGruposDias: t.plazoGruposDias,
    plazoPorRondaDias: t.plazoPorRondaDias,

    sedeGrupos: aClave(t.sedeGrupos),
    sedeEliminatorias: aClave(t.sedeEliminatorias),
    clubSede: t.clubSede?.nombre ?? null,
  };
}

// Traduce los nombres que llegan (categorías, etapa, club) a ids de la organización.
async function resolverNombres(organizacionId: number, datos: DatosConvocatoria) {
  const organizacion = await prisma.organizacion.findUniqueOrThrow({
    where: { id: organizacionId },
    select: {
      usaRanking: true,
      categorias: { where: { activa: true }, select: { id: true, nombre: true } },
      etapas: { where: { activa: true }, select: { id: true, nombre: true } },
      clubes: { select: { id: true, nombre: true } },
    },
  });

  const buscar = (filas: { id: number; nombre: string }[], nombre: string) =>
    filas.find((f) => f.nombre.toLowerCase() === nombre.toLowerCase())?.id;

  const categoriaIds = datos.categorias.map((c) => {
    const id = buscar(organizacion.categorias, c.categoria);
    if (id === undefined) throw new ErrorHttp(400, 'CATEGORIA_NO_ENCONTRADA');
    return id;
  });

  let etapaId: number | null = null;
  if (datos.etapa !== null) {
    // Sin ranking no hay casilleros que actualizar: el torneo es suelto sí o sí.
    if (!organizacion.usaRanking) throw new ErrorHttp(400, 'CIRCUITO_SIN_RANKING');
    etapaId = buscar(organizacion.etapas, datos.etapa) ?? null;
    if (etapaId === null) throw new ErrorHttp(400, 'ETAPA_NO_ENCONTRADA');
  }

  let clubSedeId: number | null = null;
  if (datos.clubSede !== null) {
    clubSedeId = buscar(organizacion.clubes, datos.clubSede) ?? null;
    if (clubSedeId === null) throw new ErrorHttp(400, 'CLUB_NO_ENCONTRADO');
  }

  return { categoriaIds, etapaId, clubSedeId };
}

// Columnas compartidas por todos los torneos de la convocatoria.
function columnasCompartidas(datos: DatosConvocatoria, etapaId: number | null, clubSedeId: number | null) {
  return {
    nombre: datos.nombre,
    // La edición agrupa los torneos de la convocatoria: es su nombre.
    edicion: datos.nombre,
    descripcion: datos.descripcion || null,
    etapaId,
    clubSedeId,

    precio: datos.precio,
    modoInscripcion: aEnum<ModoInscripcion>(datos.modoInscripcion),
    tieneListaEspera: datos.tieneListaEspera,
    cierreInscripcion: aFecha(datos.cierreInscripcion),
    fechaInicio: aFecha(datos.fechaInicio),

    cantidadGrupos: datos.cantidadGrupos,
    clasificanPorGrupo: datos.clasificanPorGrupo,
    tieneComplementaria: datos.tieneComplementaria,

    setsPorPartido: datos.setsPorPartido,
    puntoDeOro: datos.puntoDeOro,
    terceroSet: aEnum<TerceroSet>(datos.terceroSet),
    gamesPorSet: datos.gamesPorSet,
    puntosTieBreak: datos.puntosTieBreak,
    puntosSuperTieBreak: datos.puntosSuperTieBreak,

    plazoGruposDias: datos.plazoGruposDias,
    plazoPorRondaDias: datos.plazoPorRondaDias,

    sedeGrupos: aEnum<ModoSede>(datos.sedeGrupos),
    sedeEliminatorias: aEnum<ModoSede>(datos.sedeEliminatorias),
  } satisfies Partial<Prisma.TorneoUncheckedCreateInput>;
}

// El nombre identifica a la convocatoria dentro de la organización. `excepto` es la propia,
// para que guardarla sin cambiar el nombre no choque consigo misma.
async function verificarNombreLibre(organizacionId: number, nombre: string, excepto?: string) {
  if (excepto !== undefined && nombre.toLowerCase() === excepto.toLowerCase()) return;
  const otro = await prisma.torneo.findFirst({
    where: { organizacionId, edicion: { equals: nombre, mode: 'insensitive' } },
    select: { id: true },
  });
  if (otro) throw new ErrorHttp(409, 'NOMBRE_REPETIDO');
}

export async function obtenerConvocatoria(slug: string, usuarioId: number, torneoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  return aConvocatoria(await torneosDeLaConvocatoria(organizacionId, torneoId));
}

// Se crea en borrador: no es visible para los jugadores hasta que se publique.
export async function crearConvocatoria(slug: string, usuarioId: number, datos: DatosConvocatoria) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  await verificarNombreLibre(organizacionId, datos.nombre);
  const { categoriaIds, etapaId, clubSedeId } = await resolverNombres(organizacionId, datos);
  const compartidas = columnasCompartidas(datos, etapaId, clubSedeId);

  const ids = await prisma.$transaction((tx) =>
    Promise.all(
      datos.categorias.map((c, i) =>
        tx.torneo.create({
          data: { ...compartidas, organizacionId, categoriaId: categoriaIds[i], cupo: c.cupo },
          select: { id: true },
        }),
      ),
    ),
  );

  return obtenerConvocatoria(slug, usuarioId, Math.min(...ids.map((t) => t.id)));
}

export async function editarConvocatoria(slug: string, usuarioId: number, torneoId: number, datos: DatosConvocatoria) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneos = await torneosDeLaConvocatoria(organizacionId, torneoId);

  // Por ahora solo se edita el borrador. Qué se puede tocar después de publicar es otra regla.
  if (torneos.some((t) => t.estado !== EstadoTorneo.BORRADOR)) throw new ErrorHttp(409, 'TORNEO_NO_EDITABLE');

  const [principal, ...resto] = torneos;
  await verificarNombreLibre(organizacionId, datos.nombre, principal.edicion ?? principal.nombre);
  const { categoriaIds, etapaId, clubSedeId } = await resolverNombres(organizacionId, datos);
  const compartidas = columnasCompartidas(datos, etapaId, clubSedeId);

  // En borrador los torneos no tienen inscripciones ni partidos: cambiar las categorías es
  // borrar los demás y recrearlos. El principal se conserva para que el id de la URL no cambie.
  await prisma.$transaction(async (tx) => {
    if (resto.length > 0) await tx.torneo.deleteMany({ where: { id: { in: resto.map((t) => t.id) } } });

    const [primera, ...demas] = datos.categorias;
    await tx.torneo.update({
      where: { id: principal.id },
      data: { ...compartidas, categoriaId: categoriaIds[0], cupo: primera.cupo },
    });

    for (const [i, c] of demas.entries()) {
      await tx.torneo.create({
        data: { ...compartidas, organizacionId, categoriaId: categoriaIds[i + 1], cupo: c.cupo },
      });
    }
  });

  return obtenerConvocatoria(slug, usuarioId, principal.id);
}
