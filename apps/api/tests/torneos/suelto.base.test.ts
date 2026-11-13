import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';
import { convocatoriaSchema } from '@setpoint/shared';

// Contra Postgres: el torneo suelto, ajeno al circuito (decisión 089). Usa la del docker compose
// (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde. Crea una
// organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('el torneo suelto, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { crearConvocatoria } = await import('../../src/modules/torneos/torneos.service');
  const { obtenerCircuito } = await import('../../src/modules/organizaciones/circuito.service');
  const { inscribirAMano } = await import('../../src/modules/inscripciones/inscripciones.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-suelto-${marca}`;
  let admin: number;
  let bravo: number;

  const convocatoria = (nombre: string, suelto: boolean, categoria: string) =>
    convocatoriaSchema.parse({ nombre, suelto, cantidadGrupos: 2, categorias: [{ categoria, cupo: 8 }] });

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
    bravo = (await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Lucas', apellido: 'Bravo' } })).id;
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.torneo.deleteMany({ where: { organizacion: { slug } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('crea su categoría al guardarlo, y no aparece en Tu circuito', async () => {
    const creada = await crearConvocatoria(slug, admin, convocatoria('Fin de año', true, 'Libre'));

    expect(creada.suelto).toBe(true);
    expect(creada.categorias).toEqual([{ categoria: 'Libre', cupo: 8 }]);
    expect((await obtenerCircuito(slug, admin)).categorias).toEqual(['Tercera']);
  });

  it('no puede usar una categoría del circuito, y uno del circuito no puede usar una suelta', async () => {
    await expect(crearConvocatoria(slug, admin, convocatoria('Copa A', true, 'tercera'))).rejects.toMatchObject({
      codigo: 'CATEGORIA_DEL_CIRCUITO',
    });
    await expect(crearConvocatoria(slug, admin, convocatoria('Copa B', false, 'Libre'))).rejects.toMatchObject({
      codigo: 'CATEGORIA_NO_ENCONTRADA',
    });
  });

  it('otro torneo suelto reutiliza la categoría del mismo nombre', async () => {
    await crearConvocatoria(slug, admin, convocatoria('Navidad', true, 'libre'));
    expect(await prisma.categoria.count({ where: { organizacion: { slug }, suelta: true } })).toBe(1);
  });

  it('se anota cualquiera del padrón, sea de la categoría que sea', async () => {
    const { id } = await crearConvocatoria(slug, admin, convocatoria('Torneo del club', true, 'Mixto'));
    await prisma.torneo.update({ where: { id }, data: { estado: 'PUBLICADO' } });

    const inscripciones = await inscribirAMano(slug, admin, id, { jugadorId: bravo, medio: 'efectivo', monto: 0 });
    expect(inscripciones.suelto).toBe(true);
    expect(await prisma.inscripcion.count({ where: { torneoId: id, jugadorId: bravo, estado: 'PAGADA' } })).toBe(1);
  });
});
