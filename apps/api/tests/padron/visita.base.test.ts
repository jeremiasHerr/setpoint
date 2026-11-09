import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: la última visita al padrón vive en la base (decisión 083). Usa la del docker
// compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde.
// Crea una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('visita al padrón y vinculaciones, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { registrarVisita, padronDe } = await import('../../src/modules/jugadores/jugadores.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-visita-${marca}`;
  let organizacionId: number;
  let admin: number;
  let otroAdmin: number;
  let vinculado: number;
  let libre: number;

  beforeAll(async () => {
    if (!conectada) return;
    organizacionId = (await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } })).id;
    const categoria = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });

    const usuario = (email: string) => prisma.usuario.create({ data: { email: `${email}.${marca}@example.com`, nombre: 'Ana', apellido: 'Gómez' } });
    admin = (await usuario('admin')).id;
    otroAdmin = (await usuario('otro')).id;
    const cuenta = (await usuario('jugadora')).id;
    await prisma.adminOrganizacion.createMany({ data: [{ organizacionId, usuarioId: admin }, { organizacionId, usuarioId: otroAdmin }] });

    vinculado = (
      await prisma.jugador.create({
        data: {
          organizacionId,
          categoriaId: categoria.id,
          nombre: 'Ana',
          apellido: 'Gómez',
          usuarioId: cuenta,
          vinculadoEn: new Date('2026-11-05T15:00:00Z'),
          vinculadoPor: 'LINK_PERSONAL',
        },
      })
    ).id;
    libre = (await prisma.jugador.create({ data: { organizacionId, categoriaId: categoria.id, nombre: 'Bruno', apellido: 'Díaz' } })).id;

    const torneo = { organizacionId, categoriaId: categoria.id, cupo: 8, estado: 'PUBLICADO' as const };
    const abierto = await prisma.torneo.create({ data: { ...torneo, nombre: 'Abierto', edicion: 'Primavera 26' } });
    const terminado = await prisma.torneo.create({ data: { ...torneo, nombre: 'Viejo', estado: 'FINALIZADO' } });
    await prisma.inscripcion.createMany({
      data: [
        { torneoId: abierto.id, jugadorId: vinculado, estado: 'PAGADA' },
        { torneoId: terminado.id, jugadorId: vinculado, estado: 'PAGADA' },
        { torneoId: abierto.id, jugadorId: libre, estado: 'PAGADA' },
      ],
    });
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('la primera visita no tiene anterior, y cada una devuelve la de antes', async () => {
    expect(await registrarVisita(slug, admin)).toEqual({ anterior: null });

    const guardada = await prisma.adminOrganizacion.findFirstOrThrow({ where: { organizacionId, usuarioId: admin } });
    expect(await registrarVisita(slug, admin)).toEqual({ anterior: guardada.padronVistoEn!.toISOString() });
  });

  it('cada administrador tiene su visita', async () => {
    expect(await registrarVisita(slug, otroAdmin)).toEqual({ anterior: null });
  });

  it('quien no administra el circuito no guarda nada', async () => {
    const ajeno = await prisma.usuario.create({ data: { email: `ajeno.${marca}@example.com`, nombre: '', apellido: '' } });
    await expect(registrarVisita(slug, ajeno.id)).rejects.toMatchObject({ estado: 403 });
  });

  it('el padrón dice cuándo y cómo se vinculó cada cuenta, con sus inscripciones vigentes', async () => {
    const padron = await padronDe(organizacionId);
    const ana = padron.find((j) => j.id === vinculado)!;
    const bruno = padron.find((j) => j.id === libre)!;

    expect(ana).toMatchObject({
      vinculadoEn: '2026-11-05T15:00:00.000Z',
      vinculadoPor: 'link_personal',
      // La del torneo terminado ya no cuenta.
      inscripciones: [{ torneo: 'Primavera 26', estado: 'pagada' }],
    });
    // Sin cuenta no hay vinculación que mostrar, aunque esté inscripto.
    expect(bruno).toMatchObject({ vinculadoEn: null, vinculadoPor: null, inscripciones: [] });
  });
});
