import bcrypt from 'bcryptjs';
import type {
  DatosIngreso,
  DatosPedirCodigo,
  DatosRecuperarContrasena,
  DatosRegistroOrganizacion,
  DatosRestablecerContrasena,
  DatosVerificarCodigo,
  PerfilDeJugador,
  RespuestaCodigo,
  RespuestaIngresoJugador,
  RespuestaRegistro,
} from '@setpoint/shared';
import { enviarCorreo } from '../../lib/correo';
import { prisma } from '../../lib/prisma';
import { slugDisponible } from '../../lib/slug';
import {
  firmarToken,
  firmarTokenRecuperacion,
  tokenRecuperacionValido,
  usuarioDeTokenRecuperacion,
} from '../../lib/token';
import { ErrorHttp } from '../../middleware/errores';
import { codigoParaLeer, generarCodigo, hashDeCodigo, INTENTOS_MAXIMOS, MINUTOS_DE_VALIDEZ, revisarIntento } from './codigo';

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

// Lo comparten los dos ingresos, el de la web y el de la app.
async function usuarioConCredenciales(datos: DatosIngreso) {
  const usuario = await prisma.usuario.findUnique({ where: { email: datos.email } });

  const contrasenaCorrecta = await bcrypt.compare(datos.contrasena, usuario?.passwordHash ?? HASH_DE_RELLENO);
  // Mismo error para email inexistente y contraseña incorrecta.
  if (!usuario || !contrasenaCorrecta) throw new ErrorHttp(401, 'CREDENCIALES_INVALIDAS');

  return usuario;
}

export async function ingresar(datos: DatosIngreso): Promise<RespuestaRegistro> {
  const usuario = await usuarioConCredenciales(datos);

  // Si administra varias, entra a la más antigua: docs/decisiones/002-organizacion-al-ingresar.md
  const administra = await prisma.adminOrganizacion.findFirst({
    where: { usuarioId: usuario.id },
    orderBy: { creadoEn: 'asc' },
    include: { organizacion: true },
  });
  if (!administra) throw new ErrorHttp(403, 'SIN_ORGANIZACION');
  const { organizacion } = administra;

  return {
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    organizacion: { id: organizacion.id, nombre: organizacion.nombre, slug: organizacion.slug },
  };
}

// Ingreso del jugador en la app (decisión 039). Devuelve todos los circuitos en los que juega;
// si hay más de uno, elige en la app (decisión 040). Quien solo administra entra por la web.
export async function ingresarJugador(datos: DatosIngreso): Promise<RespuestaIngresoJugador> {
  const usuario = await usuarioConCredenciales(datos);

  const perfiles = await perfilesDe(usuario.id);
  if (perfiles.length === 0) throw new ErrorHttp(403, 'SIN_PERFIL_DE_JUGADOR');

  return {
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    perfiles,
  };
}

// Un perfil por circuito en el que juega, del más viejo al más nuevo. Los dados de baja del padrón
// no cuentan: ya no juegan en ese circuito.
async function perfilesDe(usuarioId: number): Promise<PerfilDeJugador[]> {
  const jugadores = await prisma.jugador.findMany({
    where: { usuarioId, activo: true },
    orderBy: { creadoEn: 'asc' },
    include: { organizacion: true, categoria: true },
  });

  return jugadores.map((j) => ({
    jugador: {
      id: j.id,
      nombre: j.nombre,
      apellido: j.apellido,
      categoria: j.categoria && { id: j.categoria.id, nombre: j.categoria.nombre },
    },
    organizacion: { id: j.organizacion.id, nombre: j.organizacion.nombre, slug: j.organizacion.slug },
  }));
}

// Cuántos códigos puede pedir un mismo email mientras dura uno. Alcanza para reenviarlo un par de
// veces y corta a quien quiera llenarle la casilla a otro.
const PEDIDOS_POR_EMAIL = 5;

// El jugador entra sin contraseña (decisión 049). No dice si el email existe: la cuenta es el email
// verificado, y si no existía se crea al verificar el código.
export async function pedirCodigo({ email }: DatosPedirCodigo) {
  const ventana = new Date(Date.now() - MINUTOS_DE_VALIDEZ * 60_000);
  const recientes = await prisma.codigoIngreso.count({ where: { email, creadoEn: { gte: ventana } } });
  if (recientes >= PEDIDOS_POR_EMAIL) throw new ErrorHttp(429, 'DEMASIADOS_PEDIDOS');

  const codigo = generarCodigo();
  await prisma.codigoIngreso.create({
    data: {
      email,
      codigoHash: hashDeCodigo(email, codigo),
      venceEn: new Date(Date.now() + MINUTOS_DE_VALIDEZ * 60_000),
    },
  });

  // El código va en el asunto: muchos lo leen desde la notificación, sin abrir el email.
  void enviarCorreo({
    para: email,
    asunto: `${codigoParaLeer(codigo)} es tu código para entrar a SetPoint`,
    texto: [
      `Tu código es ${codigoParaLeer(codigo)}.`,
      '',
      `Escribilo en la pantalla donde lo pediste. Vence en ${MINUTOS_DE_VALIDEZ} minutos, y si pediste varios, solo sirve el último.`,
      '',
      '¿No lo pediste vos? Ignorá este email: sin el código, nadie puede entrar con tu email.',
    ].join('\n'),
  }).catch((error) => console.error('No se pudo mandar el código', error));
}

export async function verificarCodigo({ email, codigo }: DatosVerificarCodigo): Promise<RespuestaCodigo> {
  // Vale solo el último: pedir uno nuevo deja sin efecto los anteriores.
  const guardado = await prisma.codigoIngreso.findFirst({ where: { email }, orderBy: { creadoEn: 'desc' } });
  const resultado = revisarIntento(guardado, codigo);

  if (!resultado.ok) {
    if (guardado && resultado.motivo !== 'vencido' && guardado.intentos < INTENTOS_MAXIMOS) {
      await prisma.codigoIngreso.update({ where: { id: guardado.id }, data: { intentos: { increment: 1 } } });
    }
    if (resultado.motivo === 'vencido') throw new ErrorHttp(400, 'CODIGO_VENCIDO');
    if (resultado.motivo === 'agotado') throw new ErrorHttp(400, 'DEMASIADOS_INTENTOS');
    const quedan = resultado.quedan === 1 ? 'Te queda 1 intento' : `Te quedan ${resultado.quedan} intentos`;
    throw new ErrorHttp(400, 'CODIGO_INCORRECTO', { codigo: quedan });
  }

  // Si llegan dos verificaciones a la vez, solo una usa el código.
  const usado = await prisma.codigoIngreso.updateMany({
    where: { id: guardado!.id, usadoEn: null },
    data: { usadoEn: new Date() },
  });
  if (usado.count === 0) throw new ErrorHttp(400, 'CODIGO_VENCIDO');

  // La cuenta es el email verificado. El nombre llega con el primer perfil que vincula.
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, nombre: '', apellido: '' },
  });

  return {
    token: firmarToken(usuario.id),
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    perfiles: await perfilesDe(usuario.id),
  };
}

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';

// No dice si el email existe: responde igual en los dos casos y el mail se manda sin esperarlo,
// para que la respuesta tarde lo mismo.
export async function pedirRecuperacion(datos: DatosRecuperarContrasena) {
  const usuario = await prisma.usuario.findUnique({ where: { email: datos.email } });
  // Los jugadores no tienen contraseña: entran con un código (decisión 049).
  if (!usuario?.passwordHash) return;

  const token = firmarTokenRecuperacion(usuario.id, usuario.passwordHash);
  const link = `${WEB_URL}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

  void enviarCorreo({
    para: usuario.email,
    asunto: 'Elegí una contraseña nueva',
    texto: [
      `Hola, ${usuario.nombre}:`,
      '',
      'Pediste cambiar la contraseña de tu cuenta de SetPoint. Entrá a este link para elegir una nueva:',
      '',
      link,
      '',
      'El link vale por una hora y sirve una sola vez. Si no fuiste vos, no hagas nada: tu contraseña sigue siendo la misma.',
    ].join('\n'),
  }).catch((error) => console.error('No se pudo mandar el mail de recuperación', error));
}

export async function restablecerContrasena(datos: DatosRestablecerContrasena) {
  const usuarioId = usuarioDeTokenRecuperacion(datos.token);
  const usuario = usuarioId === null ? null : await prisma.usuario.findUnique({ where: { id: usuarioId } });

  // Mismo error para link vencido, ya usado o inventado.
  if (!usuario?.passwordHash || !tokenRecuperacionValido(datos.token, usuario.passwordHash)) {
    throw new ErrorHttp(400, 'LINK_INVALIDO');
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash: await bcrypt.hash(datos.contrasena, COSTO_BCRYPT) },
  });
}
