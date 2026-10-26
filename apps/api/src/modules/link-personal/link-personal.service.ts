import { EstadoTorneo } from '@prisma/client';
import type { LinkPersonal, SituacionDelLink } from '@setpoint/shared';
import { DEL_PADRON, esDelPadron } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { aTorneoPublico, CONVOCATORIA } from '../torneos/torneo-publico';
import { pareceCodigoDeLink } from './codigo';

// El link personal de inscripción (decisión 050): lleva a su perfil sin pasar por la búsqueda.

// Un link regenerado y uno que nunca existió dan lo mismo: el código viejo no se guarda.
async function jugadorDelLink(codigo: string) {
  const jugador = pareceCodigoDeLink(codigo)
    ? await prisma.jugador.findUnique({
        where: { codigoLink: codigo },
        include: { organizacion: { select: { nombre: true, slug: true } }, categoria: { select: { nombre: true } } },
      })
    : null;
  // Uno dado de baja no se inscribe: para el link, es como si no existiera.
  if (!jugador || !jugador.activo || !esDelPadron(jugador)) throw new ErrorHttp(404, 'LINK_NO_ENCONTRADO');
  return jugador;
}

// Sin login: solo su nombre y los torneos abiertos de su categoría, nunca datos de contacto.
export async function linkPersonal(codigo: string): Promise<LinkPersonal> {
  const jugador = await jugadorDelLink(codigo);
  const torneos =
    jugador.categoriaId === null
      ? []
      : await prisma.torneo.findMany({
          where: { organizacionId: jugador.organizacionId, categoriaId: jugador.categoriaId, estado: EstadoTorneo.PUBLICADO },
          orderBy: [{ cierreInscripcion: 'asc' }, { id: 'asc' }],
          include: CONVOCATORIA,
        });

  return {
    organizacion: jugador.organizacion,
    jugador: { id: jugador.id, nombre: jugador.nombre, apellido: jugador.apellido, categoria: jugador.categoria?.nombre ?? null },
    vinculado: jugador.usuarioId !== null,
    torneos: torneos.map(aTorneoPublico),
  };
}

export async function situacionDelLink(codigo: string, usuarioId: number): Promise<SituacionDelLink> {
  const jugador = await jugadorDelLink(codigo);
  if (jugador.usuarioId === usuarioId) return { situacion: 'propio' };
  if (jugador.usuarioId !== null) return { situacion: 'otra_cuenta' };

  // Una cuenta tiene un solo perfil por circuito (decisión 051): si ya tiene otro, no se vincula.
  // Un perfil pendiente no es otro perfil: es una inscripción en curso, y la reserva lo dice.
  const otro = await prisma.jugador.findFirst({
    where: { organizacionId: jugador.organizacionId, usuarioId, ...DEL_PADRON },
    select: { id: true },
  });
  return { situacion: otro ? 'otro_perfil' : 'libre' };
}
