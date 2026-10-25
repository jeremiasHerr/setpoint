import { EstadoInscripcion, type Prisma } from '@prisma/client';
import type { AvisoDeInscripcion, Cuenta, InscripcionEnCurso } from '@setpoint/shared';
import { prisma } from '../../lib/prisma';
import { avisosPendientes, estadoDe, estadoEnCurso } from '../inscripcion/estados';
import { perfilesDe } from './auth.service';

// Lo que la app pide al abrirse y al volver al frente (decisión 054). La cuenta existe desde que se
// verificó el código, aunque todavía no juegue en ningún circuito: un perfil pendiente no es un
// circuito, pero sus inscripciones en curso se muestran.

// Los avisos de una solicitud no aprobada o una reserva vencida se muestran una vez; la app recuerda
// cuáles vio. Más viejos que esto ya no se mandan.
const DIAS_DE_AVISO = 30;

const CON_TORNEO = {
  torneo: {
    select: {
      nombre: true,
      edicion: true,
      categoria: { select: { nombre: true } },
      organizacion: { select: { nombre: true, slug: true } },
    },
  },
} satisfies Prisma.InscripcionInclude;

const EN_CURSO_O_PAGADAS = [
  EstadoInscripcion.SOLICITADA,
  EstadoInscripcion.APROBADA,
  EstadoInscripcion.PENDIENTE_PAGO,
  EstadoInscripcion.PAGADA,
];

type ConTorneo = Prisma.InscripcionGetPayload<{ include: typeof CON_TORNEO }>;

function deLaInscripcion(i: ConTorneo) {
  return {
    inscripcionId: i.id,
    organizacion: i.torneo.organizacion,
    torneo: i.torneo.edicion ?? i.torneo.nombre,
    categoria: i.torneo.categoria.nombre,
  };
}

export async function cuentaDe(usuarioId: number): Promise<Cuenta> {
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - DIAS_DE_AVISO * 24 * 60 * 60 * 1000);

  const [usuario, perfiles, inscripciones] = await Promise.all([
    prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } }),
    perfilesDe(usuarioId),
    // Las suyas, por quien reservó: una vez pagada y vinculada, la inscripción ya es de su circuito.
    prisma.inscripcion.findMany({
      where: {
        usuarioId,
        OR: [
          // Las pagadas no se muestran: sirven para no avisar una vencida de un torneo en el que después se inscribió.
          { estado: { in: EN_CURSO_O_PAGADAS } },
          { estado: { in: [EstadoInscripcion.NO_APROBADA, EstadoInscripcion.EXPIRADA] }, resueltaEn: { gte: desde } },
        ],
      },
      orderBy: { creadoEn: 'asc' },
      include: CON_TORNEO,
    }),
  ]);

  const enCurso: InscripcionEnCurso[] = inscripciones
    .filter((i) => estadoEnCurso(i, ahora))
    .map((i) => ({
      ...deLaInscripcion(i),
      estado: estadoDe(i, ahora) as InscripcionEnCurso['estado'],
      reservaVence: i.estado === EstadoInscripcion.PENDIENTE_PAGO ? (i.reservaVence?.toISOString() ?? null) : null,
    }));

  const avisos: AvisoDeInscripcion[] = avisosPendientes(inscripciones, desde).map((i) => ({
    ...deLaInscripcion(i),
    motivo: i.estado === EstadoInscripcion.NO_APROBADA ? 'no_aprobada' : 'vencida',
  }));

  return { usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre }, perfiles, enCurso, avisos };
}
