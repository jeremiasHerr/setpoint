import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: la lista de espera, las bajas e inscribir a mano cambian quién ocupa el cupo en
// una transacción (F13). Usa la del docker compose (`docker compose up -d db`) y se saltea si no hay
// DATABASE_URL o la base no responde. Crea una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('inscripciones (F13), contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { darDeBaja, inscribirAMano, marcarDevolucion, obtenerInscripciones } = await import(
    '../../src/modules/inscripciones/inscripciones.service'
  );
  const { vencerReservas } = await import('../../src/modules/pagos/vencimiento');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-espera-${marca}`;
  let torneoId: number;
  let admin: number;
  const id: Record<string, number> = {};
  const inscripcion: Record<string, number> = {};

  beforeAll(async () => {
    if (!conectada) return;
    const organizacion = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const organizacionId = organizacion.id;
    const categoria = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    const usuario = (nombre: string) =>
      prisma.usuario.create({ data: { email: `${nombre}.${marca}@example.com`, nombre, apellido: '' } });
    admin = (await usuario('admin')).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });

    // Dos lugares, los dos pagados, y dos en la lista de espera. Ojeda tiene cuenta: a él le llega el aviso.
    // La vinculación de Vera quedó para revisar.
    torneoId = (
      await prisma.torneo.create({
        data: { organizacionId, categoriaId: categoria.id, nombre: 'Copa de prueba', cupo: 2, precio: 45000, estado: 'PUBLICADO' },
      })
    ).id;
    const ojeda = await usuario('ojeda');
    for (const apellido of ['Bravo', 'Vera', 'Ojeda', 'Rivas', 'Lagos']) {
      const jugador = await prisma.jugador.create({
        data: {
          organizacionId,
          categoriaId: categoria.id,
          nombre: 'Jugador',
          apellido,
          usuarioId: apellido === 'Ojeda' ? ojeda.id : null,
          revision: apellido === 'Vera' ? 'HOMONIMO' : null,
        },
      });
      id[apellido] = jugador.id;
    }
    const pagada = (apellido: string, medio: 'MERCADOPAGO' | 'EFECTIVO') =>
      prisma.inscripcion.create({
        data: { torneoId, jugadorId: id[apellido], estado: 'PAGADA', pago: { create: { medio, estado: 'APROBADO', monto: 45000 } } },
      });
    inscripcion.Bravo = (await pagada('Bravo', 'MERCADOPAGO')).id;
    inscripcion.Vera = (await pagada('Vera', 'EFECTIVO')).id;
    for (const [orden, apellido] of ['Ojeda', 'Rivas'].entries()) {
      const enEspera = await prisma.inscripcion.create({
        data: { torneoId, jugadorId: id[apellido], estado: 'EN_LISTA_ESPERA', ordenListaEspera: orden + 1 },
      });
      inscripcion[apellido] = enEspera.id;
    }
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('la conciliación cobra la comisión solo sobre MercadoPago', async () => {
    const { conciliacion, libres, listaDeEspera } = await obtenerInscripciones(slug, admin, torneoId);

    expect(libres).toBe(0);
    expect(listaDeEspera.map((e) => [e.apellido, e.posicion])).toEqual([
      ['Ojeda', 1],
      ['Rivas', 2],
    ]);
    expect(conciliacion).toMatchObject({ mercadoPago: 45000, comision: 2250, teCorresponde: 42750, porFuera: 45000 });
  });

  it('marca la inscripción cuya vinculación quedó para revisar', async () => {
    const { inscripciones } = await obtenerInscripciones(slug, admin, torneoId);

    expect(Object.fromEntries(inscripciones.map((i) => [i.apellido, i.revision]))).toEqual({ Bravo: null, Vera: 'homonimo' });
  });

  it('dar de baja anota la devolución y le da el lugar al primero de la lista por 24 horas', async () => {
    const antes = Date.now();
    const datos = await darDeBaja(slug, admin, torneoId, inscripcion.Bravo, { devolucion: true });

    expect(datos.bajas).toMatchObject([{ apellido: 'Bravo', devolucion: 'pendiente', monto: 45000 }]);
    expect(datos.conciliacion).toMatchObject({ mercadoPago: 45000, aDevolver: 45000, devolucionesPendientes: 1 });

    const ojeda = datos.inscripciones.find((i) => i.apellido === 'Ojeda')!;
    expect(ojeda).toMatchObject({ estado: 'reservando', deLaListaDeEspera: true });
    const horas = (new Date(ojeda.reservaVence!).getTime() - antes) / 3_600_000;
    expect(horas).toBeGreaterThan(23.9);
    expect(horas).toBeLessThan(24.1);
    expect(datos.listaDeEspera.map((e) => e.apellido)).toEqual(['Rivas']);
  });

  it('si vence la reserva de 24 horas, el lugar pasa al siguiente', async () => {
    await prisma.inscripcion.update({ where: { id: inscripcion.Ojeda }, data: { reservaVence: new Date(Date.now() - 1000) } });
    await vencerReservas();

    const datos = await obtenerInscripciones(slug, admin, torneoId);
    expect(datos.inscripciones.map((i) => [i.apellido, i.estado])).toContainEqual(['Rivas', 'reservando']);
    expect(datos.inscripciones.map((i) => i.apellido)).not.toContain('Ojeda');
    expect(datos.listaDeEspera).toEqual([]);
  });

  it('inscribir a mano no se pasa del cupo (decisión 079)', async () => {
    await expect(inscribirAMano(slug, admin, torneoId, { jugadorId: id.Lagos, medio: 'efectivo', monto: 45000 })).rejects.toMatchObject({
      estado: 409,
      codigo: 'SIN_LUGARES',
    });
  });

  it('inscribir a mano a quien está reservando confirma su reserva', async () => {
    const datos = await inscribirAMano(slug, admin, torneoId, { jugadorId: id.Rivas, medio: 'transferencia', monto: 40000 });

    expect(datos.inscripciones.find((i) => i.apellido === 'Rivas')).toMatchObject({ estado: 'pagada', medio: 'transferencia' });
    expect(datos.conciliacion).toMatchObject({ porFuera: 85000, pagosPorFuera: 2 });
  });

  it('no vuelve a inscribir a mano a quien se dio de baja: pisaría su pago', async () => {
    await prisma.torneo.update({ where: { id: torneoId }, data: { cupo: 3 } });
    await expect(inscribirAMano(slug, admin, torneoId, { jugadorId: id.Bravo, medio: 'efectivo', monto: 45000 })).rejects.toMatchObject({
      codigo: 'DADO_DE_BAJA',
    });
  });

  it('marcar la devolución la saca de las pendientes, una sola vez', async () => {
    const datos = await marcarDevolucion(slug, admin, torneoId, inscripcion.Bravo);
    expect(datos.bajas[0].devolucion).toBe('hecha');
    expect(datos.conciliacion.aDevolver).toBe(0);

    await expect(marcarDevolucion(slug, admin, torneoId, inscripcion.Bravo)).rejects.toMatchObject({ codigo: 'SIN_DEVOLUCION_PENDIENTE' });
  });

  it('con el sorteo confirmado ya no se da de baja (decisión 077)', async () => {
    await prisma.torneo.update({ where: { id: torneoId }, data: { estado: 'ZONAS_GENERADAS', sorteoConfirmado: true } });
    await expect(darDeBaja(slug, admin, torneoId, inscripcion.Vera, { devolucion: false })).rejects.toMatchObject({
      codigo: 'SORTEO_CONFIRMADO',
    });
  });
});
