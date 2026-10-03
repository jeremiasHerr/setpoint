import bcrypt from 'bcryptjs';
import type { DatosIngreso, DatosRegistroOrganizacion, RespuestaRegistro } from '@setpoint/shared';
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

// Se compara contra este hash cuando el email no existe, para que la respuesta tarde lo mismo
// y no delate qué emails están registrados.
const HASH_DE_RELLENO = bcrypt.hashSync('contrasena-de-relleno', COSTO_BCRYPT);

export async function ingresar(datos: DatosIngreso): Promise<RespuestaRegistro> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
    include: {
      // Si administra varias, entra a la más antigua: docs/decisiones/002-organizacion-al-ingresar.md
      administra: { orderBy: { creadoEn: 'asc' }, take: 1, include: { organizacion: true } },
    },
  });

  const contrasenaCorrecta = await bcrypt.compare(datos.contrasena, usuario?.passwordHash ?? HASH_DE_RELLENO);
  // Mismo error para email inexistente y contraseña incorrecta.
  if (!usuario || !contrasenaCorrecta) throw new ErrorHttp(401, 'CREDENCIALES_INVALIDAS');

  const organizacion = usuario.administra[0]?.organizacion;
  if (!organizacion) throw new ErrorHttp(403, 'SIN_ORGANIZACION');

  return {
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    organizacion: { id: organizacion.id, nombre: organizacion.nombre, slug: organizacion.slug },
  };
}
