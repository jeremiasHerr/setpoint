import { createHash, randomBytes } from 'node:crypto';
import { pagoMercadoPagoSchema, type PagoMercadoPago } from '@setpoint/shared';
import { z } from 'zod';

// Checkout Pro de MercadoPago (05-pagos.md). Cada organización cobra con su propia cuenta, que
// conecta por OAuth (decisión 137): toda llamada que cobra o consulta un pago recibe el token de
// esa cuenta. Las variables se leen en cada llamada, para que los tests puedan cambiarlas.

const API = 'https://api.mercadopago.com';
const AUTORIZACION = 'https://auth.mercadopago.com/authorization';

// Con PAGO_SIMULADO=1 ningún pago pasa por MercadoPago: la pantalla ofrece aprobarlo o rechazarlo.
// Se activa a propósito, nunca porque falte una credencial (decisión 138). Lo pone el compose de la
// entrega, que no puede depender de cuentas externas.
export function pagoSimulado() {
  return process.env.PAGO_SIMULADO === '1';
}

// Las credenciales de la aplicación de Setpoint en MercadoPago. Sin ellas, ninguna organización
// puede conectar su cuenta.
function aplicacion() {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const apiPublica = process.env.API_URL_PUBLICA;
  if (!clientId || !clientSecret || !apiPublica) return null;
  // Tiene que coincidir exacto con la URL de redireccionamiento cargada en la aplicación.
  return { clientId, clientSecret, vuelta: `${apiPublica}/api/mercadopago/vuelta` };
}

export function sePuedeConectarMercadoPago() {
  return aplicacion() !== null;
}

function aplicacionConfigurada() {
  const datos = aplicacion();
  if (!datos) throw new Error('Faltan MERCADOPAGO_CLIENT_ID, MERCADOPAGO_CLIENT_SECRET o API_URL_PUBLICA');
  return datos;
}

// Con MERCADOPAGO_PRUEBA=1, las cuentas que se conectan reciben credenciales de prueba: el checkout
// es el del sandbox y solo acepta tarjetas de prueba, aunque quien conecte sea una cuenta real.
function modoPrueba() {
  return process.env.MERCADOPAGO_PRUEBA === '1';
}

// Error de la API de MercadoPago, con el estado HTTP: un 400 al renovar dice que la organización
// revocó el permiso, y un 500 que hay que volver a intentar.
export class ErrorMercadoPago extends Error {
  constructor(
    public estado: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

async function fallo(respuesta: Response, que: string) {
  // El motivo que da MercadoPago, para el log: sin él, un 400 no dice qué campo rechazó.
  const motivo = await respuesta.json().then(
    (d: { message?: string; error?: string }) => d.message ?? d.error,
    () => undefined,
  );
  return new ErrorMercadoPago(respuesta.status, `MercadoPago respondió ${respuesta.status} al ${que}${motivo ? `: ${motivo}` : ''}`);
}

// ---------------------------------------------------------------------------------------------
// Conexión de la cuenta de la organización (OAuth con PKCE)

// El verificador queda guardado hasta la vuelta; a MercadoPago solo va su hash.
export function pkce() {
  const verificador = randomBytes(32).toString('base64url');
  const desafio = createHash('sha256').update(verificador).digest('base64url');
  return { verificador, desafio };
}

export function urlDeAutorizacion({ estado, desafio }: { estado: string; desafio: string }) {
  const { clientId, vuelta } = aplicacionConfigurada();
  const parametros = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    platform_id: 'mp',
    state: estado,
    redirect_uri: vuelta,
    code_challenge: desafio,
    code_challenge_method: 'S256',
  });
  return `${AUTORIZACION}?${parametros}`;
}

const tokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  // En segundos. Por defecto, 180 días.
  expires_in: z.number().positive(),
  user_id: z.union([z.number(), z.string()]).transform(String),
});

export type TokensMercadoPago = z.infer<typeof tokensSchema>;

async function pedirTokens(cuerpo: Record<string, unknown>, que: string): Promise<TokensMercadoPago> {
  const { clientId, clientSecret } = aplicacionConfigurada();
  const respuesta = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, ...cuerpo }),
  });
  if (!respuesta.ok) throw await fallo(respuesta, que);
  return tokensSchema.parse(await respuesta.json());
}

// El código de la vuelta dura 10 minutos y sirve una sola vez.
export function canjearCodigo(codigo: string, verificador: string) {
  return pedirTokens(
    {
      grant_type: 'authorization_code',
      code: codigo,
      redirect_uri: aplicacionConfigurada().vuelta,
      code_verifier: verificador,
      test_token: modoPrueba(),
    },
    'canjear el código de autorización',
  );
}

// Cada renovación devuelve también un refresh token nuevo, que reemplaza al anterior.
export function renovarTokens(refreshToken: string) {
  return pedirTokens({ grant_type: 'refresh_token', refresh_token: refreshToken }, 'renovar el token');
}

const usuarioSchema = z.object({
  email: z.string().nullish(),
  nickname: z.string().nullish(),
});

// Cómo se llama la cuenta conectada, para que la organización vea cuál conectó.
export async function nombreDeLaCuenta(token: string) {
  const respuesta = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!respuesta.ok) throw await fallo(respuesta, 'consultar la cuenta');
  const usuario = usuarioSchema.parse(await respuesta.json());
  return usuario.email ?? usuario.nickname ?? null;
}

// ---------------------------------------------------------------------------------------------
// Cobro de la inscripción

type Preferencia = {
  inscripcionId: number;
  titulo: string;
  precio: number;
  // Adónde vuelve el jugador después del checkout. La confirmación no viene de ahí, sino del webhook.
  vuelta: string;
  webhook: string | null;
  // La preferencia vence con la reserva: así no se puede pagar un lugar que ya se liberó.
  vence: Date;
};

const preferenciaCreadaSchema = z.object({ id: z.string(), init_point: z.string(), sandbox_init_point: z.string().optional() });

export async function crearPreferencia(token: string, datos: Preferencia) {
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ title: datos.titulo, quantity: 1, unit_price: datos.precio, currency_id: 'ARS' }],
      // El hilo conductor entre el pago y la inscripción (04-flujo-jugador §5.4).
      external_reference: String(datos.inscripcionId),
      back_urls: { success: datos.vuelta, failure: datos.vuelta, pending: datos.vuelta },
      // MercadoPago rechaza la vuelta automática a una dirección http (localhost en desarrollo): ahí
      // el jugador vuelve con el botón "Volver al sitio" del checkout.
      ...(datos.vuelta.startsWith('https://') && { auto_return: 'approved' }),
      ...(datos.webhook && { notification_url: datos.webhook }),
      expires: true,
      expiration_date_to: datos.vence.toISOString(),
      // El pago se aprueba o se rechaza en el momento, y sin efectivo (decisión 139). Un cupón de
      // Rapipago o Pago Fácil se paga días después, cuando la reserva ya venció y el lugar pasó a otro.
      binary_mode: true,
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }] },
    }),
  });
  if (!respuesta.ok) throw await fallo(respuesta, 'crear la preferencia');
  const preferencia = preferenciaCreadaSchema.parse(await respuesta.json());
  // Con las credenciales de prueba, el checkout es el del sandbox.
  const url = token.startsWith('TEST-') ? (preferencia.sandbox_init_point ?? preferencia.init_point) : preferencia.init_point;
  return { id: preferencia.id, url };
}

// El webhook no confía en lo que recibe: consulta el pago acá, con la cuenta de la organización.
export async function consultarPago(token: string, id: string): Promise<PagoMercadoPago> {
  const respuesta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) throw await fallo(respuesta, `consultar el pago ${id}`);
  return pagoMercadoPagoSchema.parse(await respuesta.json());
}
