import { EstadoPartido, type Prisma } from '@prisma/client';
import type { DatosCrearJugador, DatosEditarJugador, JugadorPadron } from '@setpoint/shared';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { asignarPuestos, puntosVigentes } from '../ranking/ranking';

// Un W.O. cuenta como partido jugado: se registra 6-0 6-0 y entra en la tabla.
const PARTIDO_JUGADO = { estado: { in: [EstadoPartido.JUGADA, EstadoPartido.WALKOVER] } };

async function padronDe(organizacionId: number): Promise<JugadorPadron[]> {
  const [jugadores, movimientos] = await Promise.all([
    prisma.jugador.findMany({
      where: { organizacionId },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      include: {
        categoria: { select: { nombre: true } },
        usuario: { select: { nombre: true, apellido: true, email: true } },
        _count: { select: { partidosComoA: { where: PARTIDO_JUGADO }, partidosComoB: { where: PARTIDO_JUGADO } } },
      },
    }),
    prisma.movimientoRanking.findMany({
      where: { organizacionId },
      select: { id: true, jugadorId: true, categoriaId: true, etapaId: true, puntos: true, fecha: true },
    }),
  ]);

  // Cada categoría tiene su ranking: de cada jugador cuentan solo los movimientos de la
  // categoría en la que está hoy. Los de una categoría anterior quedan guardados.
  const categoriaDe = new Map(jugadores.map((j) => [j.id, j.categoriaId]));
  const puntos = puntosVigentes(movimientos.filter((m) => m.categoriaId === categoriaDe.get(m.jugadorId)));

  // Un jugador nuevo figura con 0 puntos desde que está en el padrón; uno de baja no figura.
  const enRanking = jugadores.filter((j) => j.activo && j.categoriaId !== null);
  const puestos = new Map<number, number>();
  for (const categoriaId of new Set(enRanking.map((j) => j.categoriaId))) {
    const deLaCategoria = enRanking.filter((j) => j.categoriaId === categoriaId);
    const puestosDeLaCategoria = asignarPuestos(new Map(deLaCategoria.map((j) => [j.id, puntos.get(j.id) ?? 0])));
    for (const [jugadorId, puesto] of puestosDeLaCategoria) puestos.set(jugadorId, puesto);
  }

  return jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    apellido: j.apellido,
    categoria: j.categoria?.nombre ?? null,
    telefono: j.telefono ?? '',
    activo: j.activo,
    puntos: puntos.get(j.id) ?? 0,
    puesto: puestos.get(j.id) ?? null,
    partidos: j._count.partidosComoA + j._count.partidosComoB,
    creadoEn: j.creadoEn.toISOString(),
    cuenta: j.usuario ? { nombre: `${j.usuario.nombre} ${j.usuario.apellido}`, email: j.usuario.email } : null,
  }));
}

// La fila de un jugador sale del padrón completo porque su puesto depende de los demás.
async function filaDe(organizacionId: number, jugadorId: number) {
  const fila = (await padronDe(organizacionId)).find((j) => j.id === jugadorId);
  if (!fila) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  return fila;
}

async function idDeCategoria(organizacionId: number, nombre: string | null) {
  if (nombre === null) return null;
  const categoria = await prisma.categoria.findFirst({
    where: { organizacionId, activa: true, nombre: { equals: nombre, mode: 'insensitive' } },
    select: { id: true },
  });
  if (!categoria) throw new ErrorHttp(400, 'CATEGORIA_NO_ENCONTRADA');
  return categoria.id;
}

export async function listarPadron(slug: string, usuarioId: number) {
  return padronDe(await organizacionAdministrada(slug, usuarioId));
}

// No se le crea ningún movimiento de ranking: entra con 0 puntos y sube al jugar.
export async function crearJugador(slug: string, usuarioId: number, datos: DatosCrearJugador) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);

  const jugador = await prisma.jugador.create({
    data: {
      organizacionId,
      categoriaId: await idDeCategoria(organizacionId, datos.categoria),
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono || null,
    },
  });
  return filaDe(organizacionId, jugador.id);
}

async function verificarJugador(organizacionId: number, jugadorId: number) {
  if (!Number.isInteger(jugadorId)) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const jugador = await prisma.jugador.findFirst({ where: { id: jugadorId, organizacionId }, select: { id: true } });
  if (!jugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
}

export async function editarJugador(slug: string, usuarioId: number, jugadorId: number, datos: DatosEditarJugador) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  await verificarJugador(organizacionId, jugadorId);

  const cambios: Prisma.JugadorUncheckedUpdateInput = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    activo: datos.activo,
  };
  if (datos.categoria !== undefined) cambios.categoriaId = await idDeCategoria(organizacionId, datos.categoria);
  if (datos.telefono !== undefined) cambios.telefono = datos.telefono || null;

  await prisma.jugador.update({ where: { id: jugadorId }, data: cambios });
  return filaDe(organizacionId, jugadorId);
}

// Revierte una vinculación equivocada: el perfil vuelve a quedar libre para que lo reclame
// el jugador correcto. Puntos, partidos e inscripciones cuelgan del Jugador, no de la cuenta,
// así que no se tocan. La cuenta tampoco se borra: puede seguir vinculada a otros circuitos.
export async function desvincularCuenta(slug: string, usuarioId: number, jugadorId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  await verificarJugador(organizacionId, jugadorId);

  await prisma.jugador.update({ where: { id: jugadorId }, data: { usuarioId: null } });
  return filaDe(organizacionId, jugadorId);
}
