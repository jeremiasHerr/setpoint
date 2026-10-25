import { EstadoInscripcion, EstadoTorneo, MotivoRevision, Prisma, Vinculacion } from '@prisma/client';
import type {
  CasoDeRevision,
  ComoSeVinculo,
  InscripcionEnRevision,
  JugadorPadron,
  PerfilEnRevision,
  ResolverRevision,
  Revisiones,
} from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { homonimosDe } from '../inscripcion/busqueda';
import { padronDe, SIN_VINCULAR } from '../jugadores/jugadores.service';

// Revisar vinculación (04-flujo-jugador §5.9, decisión 051): los dos casos que el sistema no
// resuelve solo. Ninguna acción cambia el email ni la cuenta de nadie: la organización decide de
// quién es cada perfil de su padrón, y qué pasa con sus inscripciones.

const COMO: Record<Vinculacion, ComoSeVinculo> = {
  LINK_PERSONAL: 'link_personal',
  BUSQUEDA: 'busqueda',
  PROPUESTA: 'propuesta',
  ORGANIZACION: 'organizacion',
};

// Las inscripciones que todavía cuentan: las pagadas y las reservas vigentes, de torneos que no
// terminaron.
function vigentes(ahora: Date): Prisma.InscripcionWhereInput {
  return {
    torneo: { estado: { notIn: [EstadoTorneo.FINALIZADO, EstadoTorneo.CANCELADO] } },
    OR: [
      { estado: EstadoInscripcion.PAGADA },
      { estado: EstadoInscripcion.PENDIENTE_PAGO, OR: [{ reservaVence: null }, { reservaVence: { gt: ahora } }] },
    ],
  };
}

const CON_TORNEO = { torneo: { select: { nombre: true, edicion: true } }, pago: true } satisfies Prisma.InscripcionInclude;

function aInscripcion(i: Prisma.InscripcionGetPayload<{ include: typeof CON_TORNEO }>): InscripcionEnRevision {
  return {
    id: i.id,
    torneo: i.torneo.edicion ?? i.torneo.nombre,
    estado: i.estado === EstadoInscripcion.PAGADA ? 'pagada' : 'reservando',
    monto: i.pago?.monto.toNumber() ?? 0,
    pagadoEn: i.estado === EstadoInscripcion.PAGADA ? (i.pago?.actualizadoEn.toISOString() ?? null) : null,
  };
}

function aPerfil(fila: JugadorPadron): PerfilEnRevision {
  return {
    jugadorId: fila.id,
    nombre: fila.nombre,
    apellido: fila.apellido,
    categoria: fila.categoria,
    desde: fila.creadoEn,
    partidos: fila.partidos,
    puntos: fila.puntos,
    puesto: fila.puesto,
    telefono: fila.telefono,
    cuenta: fila.cuenta?.email ?? null,
  };
}

export async function listarRevisiones(slug: string, usuarioId: number): Promise<Revisiones> {
  return revisionesDe(await organizacionAdministrada(slug, usuarioId));
}

async function revisionesDe(organizacionId: number): Promise<Revisiones> {
  const [casos, vinculadosSolos] = await Promise.all([
    prisma.jugador.findMany({
      where: { organizacionId, revision: { not: null } },
      orderBy: [{ vinculadoEn: 'asc' }, { id: 'asc' }],
      include: { categoria: { select: { nombre: true } } },
    }),
    prisma.jugador.count({ where: { organizacionId, vinculadoEn: { not: null }, revision: null } }),
  ]);
  return {
    casos: casos.map((j) => ({
      jugadorId: j.id,
      nombre: j.nombre,
      apellido: j.apellido,
      categoria: j.categoria?.nombre ?? null,
      motivo: j.revision === MotivoRevision.RECLAMO ? 'reclamo' : 'homonimo',
    })),
    vinculadosSolos,
  };
}

async function jugadorEnRevision(organizacionId: number, jugadorId: number) {
  if (!Number.isInteger(jugadorId)) throw new ErrorHttp(404, 'CASO_NO_ENCONTRADO');
  const jugador = await prisma.jugador.findFirst({
    where: { id: jugadorId, organizacionId, revision: { not: null } },
    include: { usuario: true, reclamadoPor: true },
  });
  if (!jugador?.usuario) throw new ErrorHttp(404, 'CASO_NO_ENCONTRADO');
  return { ...jugador, usuario: jugador.usuario };
}

// La inscripción con la que se vinculó: la última que pagó esta cuenta con el perfil.
function inscripcionDeLaVinculacion(tx: Prisma.TransactionClient, jugadorId: number, usuarioId: number) {
  return tx.inscripcion.findFirst({
    where: { jugadorId, usuarioId, estado: EstadoInscripcion.PAGADA },
    orderBy: { creadoEn: 'desc' },
    include: CON_TORNEO,
  });
}

export async function casoDeRevision(slug: string, usuarioId: number, jugadorId: number): Promise<CasoDeRevision> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const jugador = await jugadorEnRevision(organizacionId, jugadorId);
  const padron = await padronDe(organizacionId);
  const fila = padron.find((f) => f.id === jugador.id)!;

  if (jugador.revision === MotivoRevision.HOMONIMO) {
    const companeros = padron.filter((f) => f.activo && f.categoria === fila.categoria);
    const inscripcion = await inscripcionDeLaVinculacion(prisma, jugador.id, jugador.usuario.id);
    return {
      motivo: 'homonimo',
      jugadorId: jugador.id,
      cuenta: jugador.usuario.email,
      vinculadoPor: jugador.vinculadoPor && COMO[jugador.vinculadoPor],
      inscripcion: inscripcion && aInscripcion(inscripcion),
      elegido: aPerfil(fila),
      otros: homonimosDe(fila, companeros).map(aPerfil),
    };
  }

  const ahora = new Date();
  const [inscripciones, otroPerfil] = await Promise.all([
    prisma.inscripcion.findMany({
      where: { jugadorId: jugador.id, ...vigentes(ahora) },
      include: CON_TORNEO,
      orderBy: { creadoEn: 'asc' },
    }),
    jugador.reclamadoPorId
      ? prisma.jugador.findUnique({ where: { organizacionId_usuarioId: { organizacionId, usuarioId: jugador.reclamadoPorId } } })
      : null,
  ]);
  return {
    motivo: 'reclamo',
    jugadorId: jugador.id,
    perfil: aPerfil(fila),
    titular: {
      email: jugador.usuario.email,
      vinculadoEn: jugador.vinculadoEn?.toISOString() ?? null,
      vinculadoPor: jugador.vinculadoPor && COMO[jugador.vinculadoPor],
      inscripciones: inscripciones.map(aInscripcion),
    },
    reclamante: {
      // Si la cuenta que reclamó se borró, el reclamo queda sin email: se puede dejar o desvincular.
      email: jugador.reclamadoPor?.email ?? '',
      reclamadoEn: jugador.reclamadoEn?.toISOString() ?? null,
      otroPerfil: otroPerfil && `${otroPerfil.nombre} ${otroPerfil.apellido}`,
    },
  };
}

const ACCIONES_DE: Record<MotivoRevision, ResolverRevision['accion'][]> = {
  HOMONIMO: ['confirmar', 'pasar_inscripcion', 'alta_nuevo'],
  RECLAMO: ['dejar', 'pasar_perfil', 'desvincular'],
};

// Devuelve lo que queda para revisar, para seguir con el próximo caso.
export async function resolverRevision(slug: string, usuarioId: number, jugadorId: number, datos: ResolverRevision): Promise<Revisiones> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const jugador = await jugadorEnRevision(organizacionId, jugadorId);
  if (!jugador.revision || !ACCIONES_DE[jugador.revision].includes(datos.accion)) {
    throw new ErrorHttp(409, 'ACCION_NO_CORRESPONDE');
  }

  await prisma.$transaction(async (tx) => {
    switch (datos.accion) {
      case 'confirmar':
        await tx.jugador.update({ where: { id: jugador.id }, data: { revision: null } });
        return;

      case 'dejar':
        await tx.jugador.update({ where: { id: jugador.id }, data: { revision: null, reclamadoPorId: null, reclamadoEn: null } });
        return;

      case 'desvincular':
        // Queda libre para que el dueño lo reclame con su link personal. Las inscripciones quedan en el perfil.
        await tx.jugador.update({ where: { id: jugador.id }, data: SIN_VINCULAR });
        return;

      case 'pasar_perfil': {
        const reclamante = jugador.reclamadoPorId;
        if (!reclamante) throw new ErrorHttp(409, 'SIN_RECLAMANTE');
        const otro = await tx.jugador.findUnique({ where: { organizacionId_usuarioId: { organizacionId, usuarioId: reclamante } } });
        if (otro) throw new ErrorHttp(409, 'RECLAMANTE_CON_OTRO_PERFIL');

        if (datos.inscripciones === 'baja') {
          // Las que pagó la cuenta que lo tenía. La devolución, si corresponde, va por fuera del sistema.
          await tx.inscripcion.updateMany({
            where: { jugadorId: jugador.id, usuarioId: jugador.usuario.id, ...vigentes(new Date()) },
            data: { estado: EstadoInscripcion.CANCELADA, reservaVence: null },
          });
        }
        await tx.jugador.update({
          where: { id: jugador.id },
          data: {
            ...SIN_VINCULAR,
            usuarioId: reclamante,
            vinculadoEn: new Date(),
            vinculadoPor: Vinculacion.ORGANIZACION,
          },
        });
        return;
      }

      case 'pasar_inscripcion':
      case 'alta_nuevo': {
        const inscripcion = await inscripcionDeLaVinculacion(tx, jugador.id, jugador.usuario.id);
        if (!inscripcion) throw new ErrorHttp(409, 'SIN_INSCRIPCION');

        // El perfil elegido queda libre primero: una cuenta tiene un solo perfil por organización.
        await tx.jugador.update({ where: { id: jugador.id }, data: SIN_VINCULAR });
        const vinculacion = { usuarioId: jugador.usuario.id, vinculadoEn: jugador.vinculadoEn, vinculadoPor: jugador.vinculadoPor };

        let destinoId: number;
        if (datos.accion === 'pasar_inscripcion') {
          const otro = await tx.jugador.findFirst({
            where: { id: datos.aJugadorId, organizacionId, categoriaId: jugador.categoriaId, ...DEL_PADRON_ACTIVOS },
          });
          if (!otro || otro.id === jugador.id) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
          if (otro.usuarioId !== null) throw new ErrorHttp(409, 'PERFIL_VINCULADO');
          await tx.jugador.update({ where: { id: otro.id }, data: vinculacion });
          destinoId = otro.id;
        } else {
          // Con 0 puntos, como todo jugador nuevo. El nombre, el que tiene la persona.
          const nuevo = await tx.jugador.create({
            data: {
              organizacionId,
              categoriaId: jugador.categoriaId,
              nombre: jugador.usuario.nombre || jugador.nombre,
              apellido: jugador.usuario.apellido || jugador.apellido,
              ...vinculacion,
            },
          });
          destinoId = nuevo.id;
        }

        // Una fila vieja del destino en ese torneo (una reserva vencida, un pago rechazado) no
        // ocupa lugar, pero hay una sola inscripción por perfil y torneo.
        const previa = await tx.inscripcion.findUnique({
          where: { torneoId_jugadorId: { torneoId: inscripcion.torneoId, jugadorId: destinoId } },
        });
        if (previa) {
          const reservada = previa.estado === EstadoInscripcion.PENDIENTE_PAGO && (!previa.reservaVence || previa.reservaVence > new Date());
          if (previa.estado === EstadoInscripcion.PAGADA || reservada) throw new ErrorHttp(409, 'YA_INSCRIPTO');
          await tx.inscripcion.delete({ where: { id: previa.id } });
        }
        await tx.inscripcion.update({ where: { id: inscripcion.id }, data: { jugadorId: destinoId } });
        return;
      }
    }
  });

  return revisionesDe(organizacionId);
}
