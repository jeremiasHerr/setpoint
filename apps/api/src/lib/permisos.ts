import { ErrorHttp } from '../middleware/errores';
import { prisma } from './prisma';

// Devuelve el id de la organización si el usuario la administra.
export async function organizacionAdministrada(slug: string, usuarioId: number) {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    select: { id: true, admins: { where: { usuarioId }, select: { id: true } } },
  });
  if (!organizacion) throw new ErrorHttp(404, 'ORGANIZACION_NO_ENCONTRADA');
  if (organizacion.admins.length === 0) throw new ErrorHttp(403, 'SIN_PERMISO');
  return organizacion.id;
}
