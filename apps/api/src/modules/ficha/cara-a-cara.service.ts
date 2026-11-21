import { EstadoTorneo, FasePartido } from '@prisma/client';
import { caraACaraParamsSchema, nombreCuadroConsuelo, type CaraACara, type JugadorDelCaraACara, type RivalesDelJugador } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { partidosDelCaraACara, resumenDelCaraACara, rivalesConPartidos } from './cara-a-cara';
import { rankingDelJugador } from './ficha-publica.service';

// El cara a cara y la lista de rivales (F18), sin login. Ningún dato de contacto.

const jugadorSelect = {
  id: true,
  nombre: true,
  apellido: true,
  categoriaId: true,
  categoria: { select: { nombre: true, activa: true } },
} as const;

async function organizacionPorSlug(slug: string) {
  const organizacion = await prisma.organizacion.findUnique({ where: { slug }, select: { id: true, nombre: true, usaRanking: true, nombreCuadroConsuelo: true } });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  return organizacion;
}

export async function caraACara(slug: string, params: unknown): Promise<CaraACara> {
  const organizacion = await organizacionPorSlug(slug);
  const parsed = caraACaraParamsSchema.safeParse(params);
  if (!parsed.success) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  const { id: aId, rivalId: bId } = parsed.data;
  const organizacionId = organizacion.id;

  // Los dos del padrón que juegan hoy, de esta organización: el id solo no alcanza.
  const jugadores = await prisma.jugador.findMany({
    where: { id: { in: [aId, bId] }, organizacionId, ...DEL_PADRON_ACTIVOS },
    select: jugadorSelect,
  });
  const a = jugadores.find((j) => j.id === aId);
  const b = jugadores.find((j) => j.id === bId);
  if (!a || !b) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');

  const partidos = await prisma.partido.findMany({
    where: {
      torneo: { organizacionId, estado: { not: EstadoTorneo.CANCELADO } },
      OR: [
        { jugadorAId: aId, jugadorBId: bId },
        { jugadorAId: bId, jugadorBId: aId },
      ],
    },
    select: {
      id: true,
      torneoId: true,
      grupo: true,
      cuadro: true,
      ronda: true,
      jugadorAId: true,
      jugadorBId: true,
      ganadorId: true,
      estado: true,
      fechaAcordada: true,
      jugadorA: { select: { id: true, nombre: true, apellido: true } },
      jugadorB: { select: { id: true, nombre: true, apellido: true } },
      sets: { select: { gamesA: true, gamesB: true }, orderBy: { numero: 'asc' } },
    },
  });
  const torneoIds = [...new Set(partidos.map((p) => p.torneoId))];

  const [torneos, partidosDeCuadro, rankingA, rankingB] = await Promise.all([
    prisma.torneo.findMany({
      where: { id: { in: torneoIds } },
      select: { id: true, nombre: true, edicion: true, fechaInicio: true, creadoEn: true, gruposCerrados: true, categoria: { select: { nombre: true } } },
    }),
    prisma.partido.findMany({
      where: { torneoId: { in: torneoIds }, fase: FasePartido.ELIMINATORIA },
      select: { torneoId: true, cuadro: true, ronda: true },
    }),
    rankingDelJugador(organizacion, a),
    rankingDelJugador(organizacion, b),
  ]);

  const lado = (j: typeof a, ranking: typeof rankingA): JugadorDelCaraACara => ({
    jugadorId: j.id,
    nombre: j.nombre,
    apellido: j.apellido,
    categoria: j.categoria?.nombre ?? null,
    puesto: ranking?.puesto ?? null,
    puntos: ranking?.puntos ?? null,
  });

  return {
    organizacion: organizacion.nombre,
    nombreCuadroConsuelo: nombreCuadroConsuelo(organizacion.nombreCuadroConsuelo),
    a: lado(a, rankingA),
    b: lado(b, rankingB),
    resumen: resumenDelCaraACara(aId, partidos),
    partidos: partidosDelCaraACara(aId, torneos, partidos, partidosDeCuadro),
  };
}

// A quién se puede comparar: los del padrón con los que el jugador tiene partidos con resultado.
export async function rivalesDelJugador(slug: string, jugadorId: number): Promise<RivalesDelJugador> {
  const organizacion = await organizacionPorSlug(slug);
  if (!Number.isInteger(jugadorId)) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  const organizacionId = organizacion.id;

  const elJugador = await prisma.jugador.findFirst({
    where: { id: jugadorId, organizacionId, ...DEL_PADRON_ACTIVOS },
    select: { id: true, nombre: true, apellido: true },
  });
  if (!elJugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');

  const partidos = await prisma.partido.findMany({
    where: {
      torneo: { organizacionId, estado: { not: EstadoTorneo.CANCELADO } },
      OR: [{ jugadorAId: jugadorId }, { jugadorBId: jugadorId }],
    },
    select: { estado: true, ganadorId: true, jugadorAId: true, jugadorBId: true },
  });
  const cuentas = rivalesConPartidos(jugadorId, partidos);

  const padron = await prisma.jugador.findMany({
    where: { id: { in: cuentas.map((c) => c.rivalId) }, organizacionId, ...DEL_PADRON_ACTIVOS },
    select: { id: true, nombre: true, apellido: true, categoria: { select: { nombre: true } } },
  });

  return {
    organizacion: organizacion.nombre,
    jugadorId: elJugador.id,
    nombre: elJugador.nombre,
    apellido: elJugador.apellido,
    // Sin los dados de baja o fuera del padrón: no tienen ficha adonde llevar.
    rivales: cuentas.flatMap((c) => {
      const r = padron.find((p) => p.id === c.rivalId);
      return r ? [{ jugadorId: r.id, nombre: r.nombre, apellido: r.apellido, categoria: r.categoria?.nombre ?? null, partidos: c.partidos }] : [];
    }),
  };
}
