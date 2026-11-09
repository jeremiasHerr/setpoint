import { afterAll, beforeAll, describe, expect, it as base, vi } from 'vitest';

// Contra Postgres: anotarse en la lista de espera desde el link del torneo (decisiones 081 y 082).
// El número en la lista y el cupo se resuelven en una transacción serializable, así que se prueba
// con la base. Usa la del docker compose (`docker compose up -d db`) y se saltea si no hay
// DATABASE_URL o la base no responde. Crea una organización propia y la borra al terminar.

vi.mock('../../src/lib/correo', () => ({ enviarCorreo: vi.fn(async () => {}) }));

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la lista de espera desde el link, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { anotarEnListaDeEspera, buscarEnElPadron, reservar, situacionEnElTorneo } = await import(
    '../../src/modules/inscripcion/inscripcion.service'
  );
  const { inscripcionParaPagar } = await import('../../src/modules/pagos/pagos.service');
  const { darDeBaja } = await import('../../src/modules/inscripciones/inscripciones.service');
  const { alVencer } = await import('../../src/modules/inscripcion/estados');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-espera-${marca}`;
  const ids = {} as Record<
    'admin' | 'lucas' | 'dario' | 'otro' | 'franco' | 'lleno' | 'conLugar' | 'sinLista' | 'bravo' | 'diaz' | 'fuentes' | 'pagadaA',
    number
  >;

  const usuario = async (nombre: string) =>
    (await prisma.usuario.create({ data: { email: `${nombre}.${marca}@example.com`, nombre: '', apellido: '' } })).id;

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    ids.admin = await usuario('admin');
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: ids.admin } });
    [ids.lucas, ids.dario, ids.otro, ids.franco] = [await usuario('lucas'), await usuario('dario'), await usuario('otro'), await usuario('franco')];

    const jugador = async (apellido: string, usuarioId: number | null = null) =>
      (await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Jugador', apellido, usuarioId } })).id;
    const [ocupaA, ocupaB] = [await jugador('Ocupa'), await jugador('Llena')];
    // Bravo todavía no tiene cuenta: Lucas lo encuentra buscándose. Díaz ya es de Darío.
    ids.bravo = await jugador('Bravo');
    ids.diaz = await jugador('Diaz', ids.dario);
    ids.fuentes = await jugador('Fuentes', ids.franco);

    const torneo = async (nombre: string, cambios: { tieneListaEspera?: boolean } = {}) =>
      (await prisma.torneo.create({ data: { organizacionId, categoriaId, nombre, cupo: 2, estado: 'PUBLICADO', precio: 45000, ...cambios } })).id;
    ids.lleno = await torneo('Copa llena');
    ids.conLugar = await torneo('Copa con lugar');
    ids.sinLista = await torneo('Copa sin lista', { tieneListaEspera: false });

    for (const torneoId of [ids.lleno, ids.sinLista]) {
      await prisma.inscripcion.createMany({
        data: [
          { torneoId, jugadorId: ocupaA, estado: 'PAGADA' },
          { torneoId, jugadorId: ocupaB, estado: 'PAGADA' },
        ],
      });
    }
    ids.pagadaA = (await prisma.inscripcion.findFirstOrThrow({ where: { torneoId: ids.lleno, jugadorId: ocupaA } })).id;
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.pago.deleteMany({ where: { inscripcion: { torneo: { organizacion: { slug } } } } });
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('con el cupo lleno se anota al final, y anotarse otra vez devuelve el mismo lugar', async () => {
    const lucas = await anotarEnListaDeEspera(slug, ids.lleno, ids.lucas, { jugadorId: ids.bravo, vinculaPor: 'busqueda' });
    const dario = await anotarEnListaDeEspera(slug, ids.lleno, ids.dario, { jugadorId: ids.diaz });

    const [enLaLista, delPerfilPropio] = await Promise.all([
      prisma.inscripcion.findUniqueOrThrow({ where: { id: lucas.inscripcionId } }),
      prisma.inscripcion.findUniqueOrThrow({ where: { id: dario.inscripcionId } }),
    ]);
    expect(enLaLista).toMatchObject({ estado: 'EN_LISTA_ESPERA', ordenListaEspera: 1, usuarioId: ids.lucas, vinculaPor: 'BUSQUEDA' });
    // El perfil ya era suyo: no hay nada que vincular.
    expect(delPerfilPropio).toMatchObject({ estado: 'EN_LISTA_ESPERA', ordenListaEspera: 2, vinculaPor: null });

    expect(await anotarEnListaDeEspera(slug, ids.lleno, ids.lucas, { jugadorId: ids.bravo, vinculaPor: 'busqueda' })).toEqual(lucas);
  });

  it('el link y la pantalla de pago lo muestran en la lista, con su puesto', async () => {
    expect((await situacionEnElTorneo(slug, ids.lleno, ids.lucas)).inscripcion).toMatchObject({ estado: 'en_lista_espera' });

    const { inscripcionId } = await anotarEnListaDeEspera(slug, ids.lleno, ids.dario, { jugadorId: ids.diaz });
    const pago = await inscripcionParaPagar(slug, inscripcionId, ids.dario);
    expect(pago.estado).toBe('en_lista_espera');
    expect(pago.listaDeEspera).toEqual({ horas: 24, espera: { posicion: 2, ocupados: 2, cupo: 2 } });
  });

  it('el perfil que espera en la lista no aparece en la búsqueda, y nadie más lo puede elegir, tampoco en otro torneo', async () => {
    expect((await buscarEnElPadron(slug, ids.conLugar, 'bravo')).perfiles).toEqual([]);
    await expect(reservar(slug, ids.conLugar, ids.otro, { jugadorId: ids.bravo, vinculaPor: 'busqueda' })).rejects.toMatchObject({
      codigo: 'PERFIL_RESERVADO',
    });
    await expect(anotarEnListaDeEspera(slug, ids.lleno, ids.otro, { jugadorId: ids.bravo })).rejects.toMatchObject({
      codigo: 'PERFIL_RESERVADO',
    });
  });

  it('con lugares, o sin lista de espera, no se anota', async () => {
    await expect(anotarEnListaDeEspera(slug, ids.conLugar, ids.franco, { jugadorId: ids.fuentes })).rejects.toMatchObject({
      codigo: 'HAY_LUGARES',
    });
    await expect(anotarEnListaDeEspera(slug, ids.sinLista, ids.franco, { jugadorId: ids.fuentes })).rejects.toMatchObject({
      codigo: 'SIN_LISTA_DE_ESPERA',
    });
  });

  it('con una baja, al primero de la lista le toca el lugar por las horas del torneo', async () => {
    await darDeBaja(slug, ids.admin, ids.lleno, ids.pagadaA, { devolucion: false });

    const { inscripcionId } = await anotarEnListaDeEspera(slug, ids.lleno, ids.lucas, { jugadorId: ids.bravo, vinculaPor: 'busqueda' });
    const pago = await inscripcionParaPagar(slug, inscripcionId, ids.lucas);
    expect(pago.estado).toBe('reservando');
    expect(pago.listaDeEspera).toEqual({ horas: 24, espera: null });
    const horas = (new Date(pago.reservaVence!).getTime() - Date.now()) / 3_600_000;
    expect(horas).toBeGreaterThan(23.9);

    // Darío pasa a ser el primero.
    const dario = await anotarEnListaDeEspera(slug, ids.lleno, ids.dario, { jugadorId: ids.diaz });
    expect((await inscripcionParaPagar(slug, dario.inscripcionId, ids.dario)).listaDeEspera?.espera?.posicion).toBe(1);
  });

  it('con el sorteo confirmado, quien seguía en la lista ve que terminó', async () => {
    await prisma.torneo.update({ where: { id: ids.lleno }, data: { sorteoConfirmado: true } });
    const dario = await prisma.inscripcion.findFirstOrThrow({ where: { torneoId: ids.lleno, jugadorId: ids.diaz } });

    const pago = await inscripcionParaPagar(slug, dario.id, ids.dario);
    expect(pago.estado).toBe('lista_terminada');
    expect(pago.listaDeEspera).toEqual({ horas: 24, espera: null });
  });

  it('una reserva sobre una fila vencida no se confunde con una solicitud aprobada al vencer', async () => {
    // Franco tuvo una reserva que venció: la tarea le dejó resueltaEn.
    await prisma.inscripcion.create({
      data: { torneoId: ids.conLugar, jugadorId: ids.fuentes, usuarioId: ids.franco, estado: 'EXPIRADA', resueltaEn: new Date() },
    });

    const { inscripcionId } = await reservar(slug, ids.conLugar, ids.franco, { jugadorId: ids.fuentes });
    const reservada = await prisma.inscripcion.findUniqueOrThrow({ where: { id: inscripcionId } });
    expect(reservada.resueltaEn).toBeNull();
    expect(alVencer(reservada)).toBe('expirar');
  });
});
