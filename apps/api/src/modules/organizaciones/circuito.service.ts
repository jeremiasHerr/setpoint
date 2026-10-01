import { Instancia, type Prisma } from '@prisma/client';
import type { Circuito, ConfiguracionCircuito, Instancia as ClaveInstancia } from '@setpoint/shared';
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

// Devuelve el id de la organización si el usuario la administra.
async function organizacionAdministrada(slug: string, usuarioId: number) {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    select: { id: true, admins: { where: { usuarioId }, select: { id: true } } },
  });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (organizacion.admins.length === 0) throw new ErrorHttp(403, 'SIN_PERMISO');
  return organizacion.id;
}

export async function obtenerCircuito(slug: string, usuarioId: number): Promise<Circuito> {
  const id = await organizacionAdministrada(slug, usuarioId);

  const organizacion = await prisma.organizacion.findUniqueOrThrow({
    where: { id },
    include: {
      categorias: { where: { activa: true }, orderBy: { orden: 'asc' } },
      etapas: { where: { activa: true }, orderBy: { orden: 'asc' } },
      puntajes: true,
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
    jugadores: organizacion._count.jugadores,
  };
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
