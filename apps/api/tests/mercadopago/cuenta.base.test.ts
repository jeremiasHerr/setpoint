import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it as base, vi } from 'vitest';

// Contra Postgres: la conexión de la cuenta de MercadoPago de una organización, el cobro con esa
// cuenta, el webhook, la desconexión, la regla de publicar y la renovación de los tokens (decisión
// 137). MercadoPago no se llama: fetch responde lo que dice su documentación. Usa la base del docker
// compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde.
// Los casos corren en orden: cada uno parte de cómo dejó la cuenta el anterior.

vi.mock('../../src/lib/correo', () => ({ enviarCorreo: vi.fn(async () => {}) }));

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

// Antes de importar los módulos: algunos leen estas variables al cargarse. Las apagadas van vacías y
// no borradas: dotenv/config vuelve a cargar el .env al importar la API, y repone lo que falta.
Object.assign(process.env, {
  MERCADOPAGO_CLIENT_ID: '1234567890',
  MERCADOPAGO_CLIENT_SECRET: 'secreto-de-prueba',
  API_URL_PUBLICA: 'https://api.prueba',
  WEB_URL: 'https://web.prueba',
  CLAVE_TOKENS_MERCADOPAGO: 'c'.repeat(64),
  PAGO_SIMULADO: '',
  MERCADOPAGO_PRUEBA: '',
});

const respuesta = (cuerpo: unknown, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado });

describe.skipIf(!process.env.DATABASE_URL)('cuenta de MercadoPago de la organización, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const cuenta = await import('../../src/modules/mercadopago/cuenta.service');
  const pagos = await import('../../src/modules/pagos/pagos.service');
  const { publicarConvocatoria } = await import('../../src/modules/torneos/torneos.service');
  const { descifrar } = await import('../../src/lib/cifrado');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-mp-${marca}`;
  const slugOtra = `prueba-mp-otra-${marca}`;
  let organizacionId: number;
  let adminId: number;
  let jugadorUsuarioId: number;
  let inscripcionId: number;
  let inscripcionDeOtraId: number;
  let torneoId: number;
  let categoriaId: number;

  // Lo que contesta MercadoPago. Cada caso cambia lo que necesita.
  let tokens = { access_token: 'APP_USR-token-1', refresh_token: 'TG-refresh-1', expires_in: 15552000, user_id: 555 };
  let tokenResponde = (): Response => respuesta(tokens);
  let pago = { id: 9001, status: 'approved', external_reference: '', transaction_amount: 30000 };
  const fetchFalso = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
    const direccion = String(url);
    if (direccion.endsWith('/oauth/token')) return tokenResponde();
    if (direccion.endsWith('/users/me')) return respuesta({ id: 555, nickname: 'CLUBPRUEBA', email: 'cobros@club.prueba' });
    if (direccion.endsWith('/checkout/preferences')) return respuesta({ id: 'pref-1', init_point: 'https://mp.prueba/checkout' });
    if (direccion.includes('/v1/payments/')) return respuesta(pago);
    return respuesta({ message: 'no encontrado' }, 404);
  });
  vi.stubGlobal('fetch', fetchFalso);

  const llamadasA = (final: string) =>
    fetchFalso.mock.calls.filter(([url]) => String(url).endsWith(final)).map(([, init]) => init as RequestInit);
  const cuentaGuardada = () => prisma.cuentaCobro.findUniqueOrThrow({ where: { organizacionId } });

  async function conectar() {
    const { url } = await cuenta.empezarConexion(slug, adminId);
    const state = new URL(url).searchParams.get('state')!;
    return { url, state, destino: await cuenta.terminarConexion({ state, code: 'codigo-de-prueba' }) };
  }

  beforeAll(async () => {
    if (!conectada) return;
    const organizacion = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    organizacionId = organizacion.id;
    categoriaId = (await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } })).id;
    const torneo = await prisma.torneo.create({
      data: { organizacionId, categoriaId, nombre: 'Abierto de prueba', edicion: `Abierto ${marca}`, cupo: 8, estado: 'PUBLICADO', precio: 30000 },
    });
    torneoId = torneo.id;

    adminId = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Marta', apellido: 'Ríos' } })).id;
    await prisma.adminOrganizacion.create({ data: { usuarioId: adminId, organizacionId } });

    jugadorUsuarioId = (await prisma.usuario.create({ data: { email: `jugador.${marca}@example.com`, nombre: 'Ana', apellido: 'Gómez' } })).id;
    const jugador = await prisma.jugador.create({
      data: { organizacionId, categoriaId, nombre: 'Ana', apellido: 'Gómez', usuarioId: jugadorUsuarioId },
    });
    inscripcionId = (
      await prisma.inscripcion.create({
        data: { torneoId, jugadorId: jugador.id, usuarioId: jugadorUsuarioId, reservaVence: new Date(Date.now() + 15 * 60_000) },
      })
    ).id;

    // Otra organización, con una inscripción esperando su pago.
    const otra = await prisma.organizacion.create({ data: { nombre: 'Otro circuito', slug: slugOtra } });
    const categoriaOtra = await prisma.categoria.create({ data: { organizacionId: otra.id, nombre: 'Tercera', orden: 1 } });
    const torneoOtra = await prisma.torneo.create({
      data: { organizacionId: otra.id, categoriaId: categoriaOtra.id, nombre: 'Otro abierto', cupo: 8, estado: 'PUBLICADO', precio: 30000 },
    });
    const jugadorOtra = await prisma.jugador.create({ data: { organizacionId: otra.id, categoriaId: categoriaOtra.id, nombre: 'Luis', apellido: 'Paz' } });
    inscripcionDeOtraId = (
      await prisma.inscripcion.create({
        data: { torneoId: torneoOtra.id, jugadorId: jugadorOtra.id, reservaVence: new Date(Date.now() + 15 * 60_000) },
      })
    ).id;
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug: { in: [slug, slugOtra] } } } } });
    await prisma.organizacion.deleteMany({ where: { slug: { in: [slug, slugOtra] } } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('sin cuenta conectada, el pago de un torneo con importe no se puede iniciar', async () => {
    await expect(pagos.iniciarPago(slug, inscripcionId, jugadorUsuarioId)).rejects.toMatchObject({ codigo: 'SIN_MERCADOPAGO' });
  });

  it('conectar guarda los tokens cifrados, con el nombre de la cuenta, y vuelve a Tu circuito', async () => {
    const { url, state, destino } = await conectar();
    expect(destino).toBe('https://web.prueba/circuito?mercadopago=conectada');

    // El código se canjea con el verificador cuyo hash viajó en el link (PKCE).
    const [canje] = llamadasA('/oauth/token');
    const cuerpo = JSON.parse(String(canje.body));
    expect(cuerpo).toMatchObject({ grant_type: 'authorization_code', code: 'codigo-de-prueba', test_token: false });
    expect(createHash('sha256').update(cuerpo.code_verifier).digest('base64url')).toBe(new URL(url).searchParams.get('code_challenge'));

    const guardada = await cuentaGuardada();
    expect(guardada.accessToken).not.toContain('APP_USR');
    expect(descifrar(guardada.accessToken!)).toBe('APP_USR-token-1');
    expect(descifrar(guardada.refreshToken!)).toBe('TG-refresh-1');
    expect(guardada).toMatchObject({ mpUserId: '555', mpNombre: 'cobros@club.prueba', conexionEstado: null, conexionVerificador: null });
    expect((await cuenta.cuentaMercadoPago(organizacionId)).conectada?.nombre).toBe('cobros@club.prueba');

    // El state sirve una sola vez.
    expect(await cuenta.terminarConexion({ state, code: 'codigo-de-prueba' })).toBe('https://web.prueba/circuito?mercadopago=vencida');
  });

  it('sin código vuelve como cancelada, y con un state desconocido, como vencida', async () => {
    const { url } = await cuenta.empezarConexion(slug, adminId);
    const state = new URL(url).searchParams.get('state')!;
    expect(await cuenta.terminarConexion({ state })).toBe('https://web.prueba/circuito?mercadopago=cancelada');
    expect(await cuenta.terminarConexion({ state: 'otro', code: 'x' })).toBe('https://web.prueba/circuito?mercadopago=vencida');
    // La cuenta que ya estaba sigue conectada.
    expect(descifrar((await cuentaGuardada()).accessToken!)).toBe('APP_USR-token-1');
  });

  it('el cobro se crea con el token de la organización, y el aviso dice de qué organización es', async () => {
    expect(await pagos.iniciarPago(slug, inscripcionId, jugadorUsuarioId)).toEqual({ url: 'https://mp.prueba/checkout' });
    const [preferencia] = llamadasA('/checkout/preferences');
    expect((preferencia.headers as Record<string, string>).Authorization).toBe('Bearer APP_USR-token-1');
    const cuerpo = JSON.parse(String(preferencia.body));
    const aviso = new URL(cuerpo.notification_url);
    expect(aviso.searchParams.get('organizacion')).toBe(String(organizacionId));
    // Se resuelve en el momento y sin efectivo, para que un pago tardío no pase del cupo (decisión 139).
    expect(cuerpo.binary_mode).toBe(true);
    expect(cuerpo.payment_methods.excluded_payment_types).toEqual([{ id: 'ticket' }, { id: 'atm' }]);
  });

  it('con un pago en curso no se puede desconectar la cuenta', async () => {
    await expect(cuenta.desconectar(slug, adminId)).rejects.toMatchObject({ codigo: 'PAGOS_EN_CURSO' });
  });

  it('el aviso de un pago que es de otra organización no toca su inscripción', async () => {
    pago = { ...pago, external_reference: String(inscripcionDeOtraId) };
    await pagos.procesarNotificacion('9001', organizacionId);
    expect((await prisma.inscripcion.findUniqueOrThrow({ where: { id: inscripcionDeOtraId } })).estado).toBe('PENDIENTE_PAGO');
  });

  it('el aviso de un pago aprobado, consultado con la cuenta de la organización, confirma la inscripción', async () => {
    pago = { ...pago, external_reference: String(inscripcionId) };
    await pagos.procesarNotificacion('9001', organizacionId);
    const consulta = llamadasA('/v1/payments/9001').at(-1)!;
    expect((consulta.headers as Record<string, string>).Authorization).toBe('Bearer APP_USR-token-1');
    expect((await prisma.inscripcion.findUniqueOrThrow({ where: { id: inscripcionId } })).estado).toBe('PAGADA');
  });

  it('sin pagos en curso, desconectar borra los tokens', async () => {
    const resultado = await cuenta.desconectar(slug, adminId);
    expect(resultado.conectada).toBeNull();
    expect(await cuentaGuardada()).toMatchObject({ accessToken: null, refreshToken: null, mpUserId: null });
  });

  it('sin MercadoPago conectado solo se publican torneos gratis, salvo con el pago simulado', async () => {
    const fechas = { cierreInscripcion: new Date(Date.now() + 7 * 86_400_000), fechaInicio: new Date(Date.now() + 14 * 86_400_000) };
    const borrador = (nombre: string, precio: number) =>
      prisma.torneo.create({ data: { organizacionId, categoriaId, nombre, edicion: `${nombre} ${marca}`, cupo: 8, precio, ...fechas } });

    const conImporte = await borrador('Con importe', 30000);
    await expect(publicarConvocatoria(slug, adminId, conImporte.id)).rejects.toMatchObject({ codigo: 'SIN_MERCADOPAGO' });

    const gratis = await borrador('Gratis', 0);
    await expect(publicarConvocatoria(slug, adminId, gratis.id)).resolves.toBeDefined();

    process.env.PAGO_SIMULADO = '1';
    try {
      await expect(publicarConvocatoria(slug, adminId, conImporte.id)).resolves.toBeDefined();
    } finally {
      process.env.PAGO_SIMULADO = '';
    }
  });

  it('un token por vencer se renueva, y si MercadoPago rechaza la renovación la cuenta queda desconectada', async () => {
    await conectar();
    await prisma.cuentaCobro.update({ where: { organizacionId }, data: { tokenVence: new Date(Date.now() + 5 * 86_400_000) } });

    tokens = { ...tokens, access_token: 'APP_USR-token-2', refresh_token: 'TG-refresh-2' };
    await cuenta.renovarTokensPorVencer();
    const renovada = await cuentaGuardada();
    expect(descifrar(renovada.accessToken!)).toBe('APP_USR-token-2');
    expect(descifrar(renovada.refreshToken!)).toBe('TG-refresh-2');
    expect(renovada.tokenVence!.getTime()).toBeGreaterThan(Date.now() + 170 * 86_400_000);
    expect(JSON.parse(String(llamadasA('/oauth/token').at(-1)!.body))).toMatchObject({ grant_type: 'refresh_token', refresh_token: 'TG-refresh-1' });

    await prisma.cuentaCobro.update({ where: { organizacionId }, data: { tokenVence: new Date(Date.now() + 5 * 86_400_000) } });
    tokenResponde = () => respuesta({ error: 'invalid_grant', message: 'invalid refresh_token' }, 400);
    await cuenta.renovarTokensPorVencer();
    expect(await cuentaGuardada()).toMatchObject({ accessToken: null, refreshToken: null });
  });
});
