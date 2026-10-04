import { Instancia, type Prisma, type Superficie } from '@prisma/client';
import type {
  Circuito,
  ConfiguracionCircuito,
  Instancia as ClaveInstancia,
  Superficie as ClaveSuperficie,
} from '@setpoint/shared';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

const INSTANCIAS: Record<ClaveInstancia, Instancia> = {
  campeon: Instancia.CAMPEON,
  finalista: Instancia.FINALISTA,
  semifinalista: Instancia.SEMIFINALISTA,
  cuartos: Instancia.CUARTOS,
  octavos: Instancia.OCTAVOS,
  participacion: Instancia.PARTICIPACION,
};

export async function obtenerCircuito(slug: string, usuarioId: number): Promise<Circuito> {
  const id = await organizacionAdministrada(slug, usuarioId);

  const organizacion = await prisma.organizacion.findUniqueOrThrow({
    where: { id },
    include: {
      categorias: { where: { activa: true }, orderBy: { orden: 'asc' } },
      etapas: { where: { activa: true }, orderBy: { orden: 'asc' } },
      puntajes: true,
      clubes: { orderBy: { id: 'asc' }, include: { canchas: { orderBy: { id: 'asc' } } } },
      _count: { select: { jugadores: true } },
    },
  });

  // Una instancia sin fila todavía vale 0: la organización recién creada no tiene tabla de puntos.
  const puntos = Object.fromEntries(
    Object.entries(INSTANCIAS).map(([clave, instancia]) => [
      clave,
      organizacion.puntajes.find((p) => p.instancia === instancia)?.puntos ?? 0,
    ]),
  ) as ConfiguracionCircuito['puntos'];

  return {
    nombre: organizacion.nombre,
    slug: organizacion.slug,
    contacto: organizacion.contacto ?? '',
    usaRanking: organizacion.usaRanking,
    categorias: organizacion.categorias.map((c) => c.nombre),
    etapas: organizacion.etapas.map((e) => e.nombre),
    puntos,
    clubes: organizacion.clubes.map((club) => ({
      id: club.id,
      nombre: club.nombre,
      direccion: club.direccion ?? '',
      canchas: club.canchas.map((cancha) => ({
        id: cancha.id,
        nombre: cancha.nombre,
        superficie: cancha.superficie.toLowerCase() as ClaveSuperficie,
      })),
    })),
    jugadores: organizacion._count.jugadores,
  };
}

// Empareja lo que llega con lo que hay: primero por id y, si no trae, por nombre.
// La web no conoce el id de lo que creó en esta sesión, así que lo vuelve a mandar sin id.
function emparejar<Llega extends { id?: number; nombre: string }, Hay extends { id: number; nombre: string }>(
  llegan: Llega[],
  hay: Hay[],
) {
  const libres = new Set(hay);
  const tomar = (condicion: (fila: Hay) => boolean) => {
    const fila = [...libres].find(condicion);
    if (fila) libres.delete(fila);
    return fila;
  };

  const porId = llegan.map((fila) => (fila.id === undefined ? undefined : tomar((h) => h.id === fila.id)));
  const pares = llegan.map((fila, i) => ({
    llega: fila,
    existente: porId[i] ?? tomar((h) => h.nombre.toLowerCase() === fila.nombre.toLowerCase()),
  }));
  return { pares, sobran: [...libres] };
}

// Deja exactamente los clubes y canchas recibidos. A diferencia de categorías y etapas, lo que
// sale de la lista se borra: Club y Cancha no tienen columna `activa`. Si un torneo o un partido
// ya lo usa, no se puede borrar.
async function sincronizarClubes(
  tx: Prisma.TransactionClient,
  organizacionId: number,
  clubes: ConfiguracionCircuito['clubes'],
) {
  const existentes = await tx.club.findMany({
    where: { organizacionId },
    include: {
      canchas: { include: { _count: { select: { partidos: true } } } },
      _count: { select: { torneos: true, partidos: true } },
    },
  });
  const { pares, sobran } = emparejar(clubes, existentes);

  // Primero los borrados: liberan nombres que otro club puede estar tomando.
  if (sobran.some((club) => club._count.torneos + club._count.partidos > 0)) throw new ErrorHttp(409, 'CLUB_EN_USO');
  if (sobran.length > 0) await tx.club.deleteMany({ where: { id: { in: sobran.map((c) => c.id) } } });

  for (const { llega, existente } of pares) {
    const datos = { nombre: llega.nombre, direccion: llega.direccion || null };
    const club = existente
      ? await tx.club.update({ where: { id: existente.id }, data: datos })
      : await tx.club.create({ data: { ...datos, organizacionId } });

    const canchas = emparejar(llega.canchas, existente?.canchas ?? []);
    if (canchas.sobran.some((cancha) => cancha._count.partidos > 0)) throw new ErrorHttp(409, 'CLUB_EN_USO');
    if (canchas.sobran.length > 0) {
      await tx.cancha.deleteMany({ where: { id: { in: canchas.sobran.map((c) => c.id) } } });
    }

    for (const cancha of canchas.pares) {
      const datosCancha = { nombre: cancha.llega.nombre, superficie: cancha.llega.superficie.toUpperCase() as Superficie };
      if (cancha.existente) await tx.cancha.update({ where: { id: cancha.existente.id }, data: datosCancha });
      else await tx.cancha.create({ data: { ...datosCancha, clubId: club.id } });
    }
  }
}

type ModeloLista = 'categoria' | 'etapa';

// Deja activos exactamente los nombres recibidos, en ese orden.
// Los que salen de la lista se desactivan en vez de borrarse: pueden tener torneos o jugadores
// apuntándoles, y esas FK no tienen cascade. Si el nombre vuelve, se reactiva la misma fila.
async function sincronizarLista(
  tx: Prisma.TransactionClient,
  modelo: ModeloLista,
  organizacionId: number,
  nombres: string[],
) {
  // Categoria y Etapa tienen las mismas columnas: se opera sobre las dos con el mismo delegado.
  const delegado = (modelo === 'categoria' ? tx.categoria : tx.etapa) as Prisma.CategoriaDelegate;
  const existentes = await delegado.findMany({ where: { organizacionId } });
  const porNombre = new Map(existentes.map((fila) => [fila.nombre.toLowerCase(), fila]));

  for (const [orden, nombre] of nombres.entries()) {
    const existente = porNombre.get(nombre.toLowerCase());
    if (existente) {
      await delegado.update({ where: { id: existente.id }, data: { nombre, orden, activa: true } });
    } else {
      await delegado.create({ data: { organizacionId, nombre, orden } });
    }
  }

  const quedan = new Set(nombres.map((n) => n.toLowerCase()));
  const salen = existentes.filter((fila) => fila.activa && !quedan.has(fila.nombre.toLowerCase()));
  if (salen.length > 0) {
    await delegado.updateMany({ where: { id: { in: salen.map((f) => f.id) } }, data: { activa: false } });
  }
}

export async function guardarCircuito(slug: string, usuarioId: number, datos: ConfiguracionCircuito) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);

  await prisma.$transaction(async (tx) => {
    await tx.organizacion.update({
      where: { id: organizacionId },
      data: { nombre: datos.nombre, contacto: datos.contacto || null, usaRanking: datos.usaRanking },
    });

    await sincronizarLista(tx, 'categoria', organizacionId, datos.categorias);
    await sincronizarLista(tx, 'etapa', organizacionId, datos.etapas);
    await sincronizarClubes(tx, organizacionId, datos.clubes);

    for (const [clave, puntos] of Object.entries(datos.puntos)) {
      const instancia = INSTANCIAS[clave as ClaveInstancia];
      await tx.puntajeInstancia.upsert({
        where: { organizacionId_instancia: { organizacionId, instancia } },
        create: { organizacionId, instancia, puntos },
        update: { puntos },
      });
    }
  });

  return obtenerCircuito(slug, usuarioId);
}
