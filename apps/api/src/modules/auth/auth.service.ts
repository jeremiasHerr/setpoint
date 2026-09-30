import bcrypt from 'bcryptjs';
import type { DatosRegistroOrganizacion, RespuestaRegistro } from '@setpoint/shared';
import { prisma } from '../../lib/prisma';
import { slugDisponible } from '../../lib/slug';
import { firmarToken } from '../../lib/token';
import { ErrorHttp } from '../../middleware/errores';

const COSTO_BCRYPT = 10;

export async function registrarOrganizacion(datos: DatosRegistroOrganizacion): Promise<RespuestaRegistro> {
  const passwordHash = await bcrypt.hash(datos.contrasena, COSTO_BCRYPT);

  const organizacion = await prisma.$transaction(async (tx) => {
    const existente = await tx.usuario.findUnique({ where: { email: datos.email } });
    if (existente) throw new ErrorHttp(409, 'EMAIL_EN_USO');

    const slug = await slugDisponible(tx, datos.organizacion);

    return tx.organizacion.create({
      data: {
        nombre: datos.organizacion,
        slug,
        // El ranking es opcional: se arranca con torneos sueltos y se activa después (07-configurabilidad §1).
        usaRanking: false,
        admins: {
          create: {
            usuario: {
              create: {
                email: datos.email,
                passwordHash,
                nombre: datos.nombre,
                // El formulario pide un solo campo "Tu nombre" y apellido es obligatorio en el schema.
                apellido: '',
              },
            },
          },
        },
      },
      include: { admins: { include: { usuario: true } } },
    });
  });

  const usuario = organizacion.admins[0].usuario;

  return {
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    organizacion: { id: organizacion.id, nombre: organizacion.nombre, slug: organizacion.slug },
  };
}
