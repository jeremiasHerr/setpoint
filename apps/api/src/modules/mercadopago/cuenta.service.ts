import { randomBytes } from 'node:crypto';
import { EstadoInscripcion, TipoCuentaCobro } from '@prisma/client';
import type { ConexionMercadoPago, CuentaMercadoPago, VueltaDeMercadoPago } from '@setpoint/shared';
import { cifrar, descifrar, hayClaveDeCifrado } from '../../lib/cifrado';
import {
  canjearCodigo,
  ErrorMercadoPago,
  nombreDeLaCuenta,
  pagoSimulado,
  pkce,
  renovarTokens,
  sePuedeConectarMercadoPago,
  urlDeAutorizacion,
  type TokensMercadoPago,
} from '../../lib/mercadopago';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';

// Cada organización cobra con su propia cuenta de MercadoPago, que conecta desde Tu circuito por
// OAuth (decisión 137). La plata de las inscripciones le llega directo, sin pasar por Setpoint.

const WEB_URL = process.env.WEB_URL ?? 'http://localhost:5173';
// Lo que tiene la organización para autorizar en MercadoPago: iniciar sesión puede llevar un rato.
const MINUTOS_PARA_CONECTAR = 30;
const DIA = 24 * 60 * 60 * 1000;

const SIN_CUENTA = { accessToken: null, refreshToken: null, tokenVence: null, mpUserId: null, mpNombre: null, conectadaEn: null };

function disponible() {
  return sePuedeConectarMercadoPago() && hayClaveDeCifrado();
}

export async function cuentaMercadoPago(organizacionId: number): Promise<CuentaMercadoPago> {
  const cuenta = await prisma.cuentaCobro.findUnique({ where: { organizacionId } });
  return {
    disponible: disponible(),
    pagoSimulado: pagoSimulado(),
    conectada: cuenta?.accessToken && cuenta.conectadaEn ? { nombre: cuenta.mpNombre, desde: cuenta.conectadaEn.toISOString() } : null,
  };
}

// El link para autorizar a Setpoint. Queda guardado un solo intento por organización: empezar otro
// reemplaza al anterior.
export async function empezarConexion(slug: string, usuarioId: number): Promise<ConexionMercadoPago> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!disponible()) throw new ErrorHttp(409, 'MERCADOPAGO_NO_DISPONIBLE');

  const estado = randomBytes(24).toString('base64url');
  const { verificador, desafio } = pkce();
  const conexion = {
    conexionEstado: estado,
    conexionVerificador: verificador,
    conexionVence: new Date(Date.now() + MINUTOS_PARA_CONECTAR * 60_000),
  };
  await prisma.cuentaCobro.upsert({
    where: { organizacionId },
    create: { organizacionId, tipo: TipoCuentaCobro.PROPIA, ...conexion },
    update: conexion,
  });
  return { url: urlDeAutorizacion({ estado, desafio }) };
}

// MercadoPago devuelve a la organización con el código y el state. La API canjea el código y la
// manda a Tu circuito, con cómo le fue en ?mercadopago=.
export async function terminarConexion(vuelta: { state?: unknown; code?: unknown }) {
  const resultado = await resolverVuelta(vuelta);
  return `${WEB_URL}/circuito?mercadopago=${resultado}`;
}

async function resolverVuelta({ state, code }: { state?: unknown; code?: unknown }): Promise<VueltaDeMercadoPago> {
  if (typeof state !== 'string' || state === '') return 'error';
  const cuenta = await prisma.cuentaCobro.findUnique({ where: { conexionEstado: state } });
  if (!cuenta) return 'vencida';

  // El state sirve una vez: se borra antes de canjear el código. Con la condición, dos vueltas
  // con el mismo state no pasan las dos.
  const { count } = await prisma.cuentaCobro.updateMany({
    where: { id: cuenta.id, conexionEstado: state },
    data: { conexionEstado: null, conexionVerificador: null, conexionVence: null },
  });
  if (count === 0 || !cuenta.conexionVerificador || !cuenta.conexionVence || cuenta.conexionVence < new Date()) return 'vencida';
  // Sin código, la organización no autorizó a Setpoint.
  if (typeof code !== 'string' || code === '') return 'cancelada';

  let tokens: TokensMercadoPago;
  try {
    tokens = await canjearCodigo(code, cuenta.conexionVerificador);
  } catch (error) {
    console.error('No se pudo conectar la cuenta de MercadoPago', error);
    return 'error';
  }

  // Los pagos en curso se consultan con la cuenta que los cobró: cambiarla ahora los dejaría sin
  // confirmar.
  const otraCuenta = cuenta.accessToken !== null && cuenta.mpUserId !== tokens.user_id;
  if (otraCuenta && (await hayPagosEnCurso(cuenta.organizacionId))) return 'otra-cuenta-con-pagos';

  // El nombre es para mostrarla: si MercadoPago no lo da, la cuenta queda conectada igual.
  const nombre = await nombreDeLaCuenta(tokens.access_token).catch((error) => {
    console.error('No se pudo leer el nombre de la cuenta de MercadoPago', error);
    return null;
  });
  await prisma.cuentaCobro.update({
    where: { id: cuenta.id },
    data: { tipo: TipoCuentaCobro.PROPIA, ...tokensCifrados(tokens), mpUserId: tokens.user_id, mpNombre: nombre, conectadaEn: new Date() },
  });
  return 'conectada';
}

function tokensCifrados(tokens: TokensMercadoPago, ahora = new Date()) {
  return {
    accessToken: cifrar(tokens.access_token),
    refreshToken: cifrar(tokens.refresh_token),
    tokenVence: new Date(ahora.getTime() + tokens.expires_in * 1000),
  };
}

export async function desconectar(slug: string, usuarioId: number): Promise<CuentaMercadoPago> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (await hayPagosEnCurso(organizacionId)) throw new ErrorHttp(409, 'PAGOS_EN_CURSO');
  await prisma.cuentaCobro.updateMany({ where: { organizacionId }, data: SIN_CUENTA });
  return cuentaMercadoPago(organizacionId);
}

// Pagos que todavía pueden llegar por el webhook: los que abrieron el checkout y no se resolvieron.
// Sin la cuenta que los cobró no hay con qué consultarlos.
async function hayPagosEnCurso(organizacionId: number) {
  const enCurso = await prisma.inscripcion.count({
    where: { torneo: { organizacionId }, estado: EstadoInscripcion.PENDIENTE_PAGO, pago: { mpPreferenceId: { not: null } } },
  });
  return enCurso > 0;
}

// El token con el que se cobra y se consultan los pagos de la organización. null si no conectó
// MercadoPago.
export async function tokenDeLaOrganizacion(organizacionId: number) {
  const cuenta = await prisma.cuentaCobro.findUnique({ where: { organizacionId }, select: { accessToken: true } });
  return cuenta?.accessToken ? descifrar(cuenta.accessToken) : null;
}

// Un torneo que cobra inscripción necesita con qué cobrarla: sin MercadoPago conectado, solo se
// publican torneos gratis. Con el pago simulado no hace falta (decisión 137).
export async function exigirCobroDisponible(organizacionId: number, precio: number) {
  if (precio === 0 || pagoSimulado()) return;
  const conectada = await prisma.cuentaCobro.count({ where: { organizacionId, accessToken: { not: null } } });
  if (conectada > 0) return;
  throw new ErrorHttp(400, 'SIN_MERCADOPAGO', { precio: 'Para cobrar la inscripción, conectá tu MercadoPago en Tu circuito' });
}

// Los tokens duran 180 días y se renuevan con un mes de margen. Corre una tarea por vez, así que dos
// renovaciones de la misma cuenta no se pisan: cada una cambia también el refresh token.
const MARGEN_DIAS = 30;

export async function renovarTokensPorVencer(ahora = new Date()) {
  const cuentas = await prisma.cuentaCobro.findMany({
    where: { refreshToken: { not: null }, tokenVence: { lte: new Date(ahora.getTime() + MARGEN_DIAS * DIA) } },
  });
  for (const cuenta of cuentas) {
    try {
      const tokens = await renovarTokens(descifrar(cuenta.refreshToken!));
      await prisma.cuentaCobro.update({ where: { id: cuenta.id }, data: tokensCifrados(tokens, ahora) });
    } catch (error) {
      // Un 400 o un 401 es que la organización le sacó el permiso a Setpoint: la cuenta queda
      // desconectada y Tu circuito le ofrece volver a conectarla. Otro error se reintenta después.
      if (error instanceof ErrorMercadoPago && (error.estado === 400 || error.estado === 401)) {
        await prisma.cuentaCobro.update({ where: { id: cuenta.id }, data: SIN_CUENTA });
      }
      console.error(`No se pudo renovar el token de MercadoPago de la organización ${cuenta.organizacionId}`, error);
    }
  }
  return cuentas.length;
}

const CADA_12_HORAS = 12 * 60 * 60 * 1000;

export function programarRenovacionDeTokens() {
  const revisar = () => renovarTokensPorVencer().catch((error) => console.error('No se pudieron renovar los tokens de MercadoPago', error));
  void revisar();
  setInterval(revisar, CADA_12_HORAS).unref();
}
