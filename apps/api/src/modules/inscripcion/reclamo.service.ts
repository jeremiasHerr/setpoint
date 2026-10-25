import { MotivoRevision } from '@prisma/client';
import type { DatosReclamarPerfil } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

// "Avisarle a la organización" (decisión 051): otra cuenta dice que el perfil es suyo. Abre el caso
// en "Para revisar" con su email verificado y no cambia nada más: decide la organización.
export async function reclamarPerfil(slug: string, usuarioId: number, datos: DatosReclamarPerfil) {
  const jugador = await prisma.jugador.findFirst({
    where: { id: datos.jugadorId, organizacion: { slug }, ...DEL_PADRON_ACTIVOS },
  });
  if (!jugador) throw new ErrorHttp(404, 'JUGADOR_NO_ENCONTRADO');
  // Un perfil libre no se reclama: se inscribe con él y queda vinculado.
  if (jugador.usuarioId === null) throw new ErrorHttp(409, 'PERFIL_LIBRE');
  if (jugador.usuarioId === usuarioId) throw new ErrorHttp(409, 'YA_ES_TUYO');

  // Si ya hay un reclamo abierto, queda el primero hasta que la organización lo resuelva. Al que
  // reclama después se le responde igual: no tiene por qué saber que otro reclamó.
  if (jugador.revision === MotivoRevision.RECLAMO) return;

  await prisma.jugador.update({
    where: { id: jugador.id },
    data: { revision: MotivoRevision.RECLAMO, reclamadoPorId: usuarioId, reclamadoEn: new Date() },
  });
}
