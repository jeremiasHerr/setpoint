import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: el link público del torneo lleva su nombre (decisión 140). Usa la base del docker
// compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde. Crea
// una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('link del torneo con su nombre, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { publicarConvocatoria } = await import('../../src/modules/torneos/torneos.service');
  const { torneoPublico } = await import('../../src/modules/torneos/torneo-publico');
  const { asignarSlugsFaltantes } = await import('../../src/modules/torneos/link-del-torneo');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-link-${marca}`;
  let organizacionId: number;
  let adminId: number;
  let segunda: number;
  let tercera: number;

  const fechas = () => ({ cierreInscripcion: new Date(Date.now() + 7 * 86_400_000), fechaInicio: new Date(Date.now() + 14 * 86_400_000) });

  // Un borrador gratis, en una o varias categorías, como lo deja Nuevo torneo.
  async function borrador(nombre: string, categorias: number[], estado: 'BORRADOR' | 'PUBLICADO' = 'BORRADOR') {
    const ids = [];
    for (const categoriaId of categorias) {
      ids.push(
        (await prisma.torneo.create({ data: { organizacionId, categoriaId, nombre, edicion: nombre, cupo: 8, precio: 0, estado, ...fechas() } })).id,
      );
    }
    return ids;
  }
  const slugDe = async (id: number) => (await prisma.torneo.findUniqueOrThrow({ where: { id } })).slugPublico;

  beforeAll(async () => {
    if (!conectada) return;
    organizacionId = (await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } })).id;
    segunda = (await prisma.categoria.create({ data: { organizacionId, nombre: 'Segunda', orden: 1 } })).id;
    tercera = (await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 2 } })).id;
    adminId = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Marta', apellido: 'Ríos' } })).id;
    await prisma.adminOrganizacion.create({ data: { usuarioId: adminId, organizacionId } });
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('al publicar, el torneo de una sola categoría toma su nombre, sin acentos ni mayúsculas', async () => {
    const [id] = await borrador('Torneo Test Pagó', [segunda]);
    expect(await slugDe(id)).toBeNull();
    await publicarConvocatoria(slug, adminId, id);
    expect(await slugDe(id)).toBe('torneo-test-pago');
  });

  it('con varias categorías, cada una suma la suya', async () => {
    const [deSegunda, deTercera] = await borrador('Primavera 2026', [segunda, tercera]);
    await publicarConvocatoria(slug, adminId, deSegunda);
    expect(await slugDe(deSegunda)).toBe('primavera-2026-segunda');
    expect(await slugDe(deTercera)).toBe('primavera-2026-tercera');
  });

  it('un nombre que ya usa otro torneo de la organización lleva -2', async () => {
    const [id] = await borrador('Torneo test pago!', [tercera]);
    await publicarConvocatoria(slug, adminId, id);
    expect(await slugDe(id)).toBe('torneo-test-pago-2');
  });

  it('un nombre de solo números no se confunde con el número de los links viejos', async () => {
    const [id] = await borrador('2026', [segunda]);
    await publicarConvocatoria(slug, adminId, id);
    expect(await slugDe(id)).toBe('torneo-2026');
  });

  it('el link se encuentra por el slug y por el número, y el slug no cambia si cambia el nombre', async () => {
    const [id] = await borrador('Copa de invierno', [segunda]);
    await publicarConvocatoria(slug, adminId, id);
    await prisma.torneo.update({ where: { id }, data: { nombre: 'Copa de verano', edicion: 'Copa de verano' } });

    const porSlug = await torneoPublico(slug, 'copa-de-invierno');
    expect(porSlug).toMatchObject({ id, slugPublico: 'copa-de-invierno', nombre: 'Copa de verano' });
    expect((await torneoPublico(slug, String(id))).id).toBe(id);
    // El slug de otra organización no alcanza.
    await expect(torneoPublico('otra-organizacion', 'copa-de-invierno')).rejects.toMatchObject({ codigo: 'TORNEO_NO_ENCONTRADO' });
  });

  it('los torneos publicados antes de que hubiera slug lo reciben al arrancar; los borradores no', async () => {
    const [publicadoSegunda, publicadoTercera] = await borrador('Otoño 2026', [segunda, tercera], 'PUBLICADO');
    const [enBorrador] = await borrador('Invierno 2026', [segunda]);

    await asignarSlugsFaltantes();
    expect(await slugDe(publicadoSegunda)).toBe('otono-2026-segunda');
    expect(await slugDe(publicadoTercera)).toBe('otono-2026-tercera');
    expect(await slugDe(enBorrador)).toBeNull();
  });
});
