import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';
import { configuracionCircuitoSchema } from '@setpoint/shared';

// Contra Postgres: los contactos de la organización (decisión 091). Usa la del docker compose
// (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde. Crea una
// organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('los contactos de la organización, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { guardarCircuito, obtenerCircuito } = await import('../../src/modules/organizaciones/circuito.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-contactos-${marca}`;
  let admin: number;

  const configuracion = (contactos: { tipo: 'whatsapp' | 'red_social'; valor: string }[]) =>
    configuracionCircuitoSchema.parse({
      nombre: 'Circuito de prueba',
      contactos,
      usaRanking: false,
      categorias: [],
      etapas: [],
      puntos: { campeon: 100, finalista: 75, semifinalista: 50, cuartos: 25, octavos: 15, participacion: 10 },
    });

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('guarda varios, de distinto tipo, en el orden de la pantalla', async () => {
    const contactos = [
      { tipo: 'whatsapp' as const, valor: '299 412 3456' },
      { tipo: 'red_social' as const, valor: '@polentatenis' },
    ];
    await guardarCircuito(slug, admin, configuracion(contactos));
    expect((await obtenerCircuito(slug, admin)).contactos).toEqual(contactos);
  });

  it('quitar uno lo borra, sin tocar los demás', async () => {
    await guardarCircuito(slug, admin, configuracion([{ tipo: 'red_social', valor: '@polentatenis' }]));
    expect((await obtenerCircuito(slug, admin)).contactos).toEqual([{ tipo: 'red_social', valor: '@polentatenis' }]);
    expect(await prisma.contactoOrganizacion.count({ where: { organizacion: { slug } } })).toBe(1);
  });
});
