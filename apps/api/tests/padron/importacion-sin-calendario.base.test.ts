import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: una organización recién registrada, sin categorías ni torneos del calendario,
// confirma la importación de su planilla y queda configurada (decisiones 011 y 098). La importación
// se arma ya procesada, sin llamar a la IA. Crea organizaciones propias y las borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la importación configura el circuito, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { confirmarImportacion, obtenerImportacion } = await import(
    '../../src/modules/padron/importacion/importaciones.service'
  );

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  let admin: number;

  // Dos jugadores nuevos con puntos en Primavera 25 y Verano 26.
  const propuesta = [
    { fila: 4, nombre: 'Federico', apellido: 'Lucero', casilleros: [{ etapa: 'Primavera', anio: 2025, puntos: 15 }, { etapa: 'Verano', anio: 2026, puntos: 10 }], acumulado: 25, coincideCon: null, confianza: null },
    { fila: 5, nombre: 'Ignacio', apellido: 'Vera', casilleros: [{ etapa: 'Primavera', anio: 2025, puntos: 0 }, { etapa: 'Verano', anio: 2026, puntos: 50 }], acumulado: 50, coincideCon: null, confianza: null },
  ];
  const decisiones = [
    { fila: 4, accion: 'crear' as const },
    { fila: 5, accion: 'crear' as const },
  ];

  async function organizacionConImportacion(sufijo: string, categoriaNueva: string | null) {
    const slug = `prueba-importacion-${sufijo}-${marca}`;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito nuevo', slug, usaRanking: false } });
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
    const { id } = await prisma.importacionPadron.create({
      data: {
        organizacionId,
        archivoNombre: 'Ranking Tercera 2026.xlsx',
        estado: 'PROCESADO',
        resumen: {
          categoriaId: null,
          categoriaNueva,
          etapas: ['Primavera', 'Verano'],
          propuesta,
          textos: {},
          auditoria: { globales: [], porFila: [] },
          conteos: { existentes: 0, nuevos: 2, dudosos: 0, conProblemas: 0 },
          error: null,
        },
      },
    });
    return { slug, organizacionId, id };
  }

  beforeAll(async () => {
    if (!conectada) return;
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.organizacion.deleteMany({ where: { slug: { endsWith: `-${marca}` } } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('antes de confirmar dice qué se crea; al confirmar, lo crea y enciende el ranking', async () => {
    const { slug, organizacionId, id } = await organizacionConImportacion('nueva', 'Tercera');

    expect((await obtenerImportacion(slug, admin, id)).crea).toEqual({
      categoria: 'Tercera',
      etapas: ['Primavera', 'Verano'],
      ranking: true,
    });

    const resultado = await confirmarImportacion(slug, admin, id, { decisiones });
    expect(resultado).toMatchObject({ creados: 2, movimientosCreados: 3 });

    const [organizacion, categorias, etapas, jugadores, movimientos] = await Promise.all([
      prisma.organizacion.findUniqueOrThrow({ where: { id: organizacionId } }),
      prisma.categoria.findMany({ where: { organizacionId } }),
      prisma.etapa.findMany({ where: { organizacionId }, orderBy: { orden: 'asc' } }),
      prisma.jugador.findMany({ where: { organizacionId } }),
      prisma.movimientoRanking.findMany({ where: { organizacionId }, include: { etapa: true } }),
    ]);
    expect(organizacion.usaRanking).toBe(true);
    expect(categorias.map((c) => c.nombre)).toEqual(['Tercera']);
    expect(etapas.map((e) => e.nombre)).toEqual(['Primavera', 'Verano']);
    expect(jugadores.every((j) => j.categoriaId === categorias[0].id)).toBe(true);
    expect(movimientos.map((m) => `${m.etapa!.nombre} ${m.puntos}`).sort()).toEqual(['Primavera 15', 'Verano 10', 'Verano 50']);
  });

  it('reactiva el torneo del calendario que se había quitado, en vez de chocar con su nombre', async () => {
    const { slug, organizacionId, id } = await organizacionConImportacion('reactiva', 'Tercera');
    const { id: quitada } = await prisma.etapa.create({ data: { organizacionId, nombre: 'Verano', orden: 0, activa: false } });

    await confirmarImportacion(slug, admin, id, { decisiones });

    const verano = await prisma.etapa.findUniqueOrThrow({ where: { id: quitada } });
    expect(verano.activa).toBe(true);
    expect(await prisma.etapa.count({ where: { organizacionId, nombre: 'Verano' } })).toBe(1);
  });

  it('sin categoría en la planilla, pide elegirla al confirmar', async () => {
    const { slug, organizacionId, id } = await organizacionConImportacion('sin-categoria', null);

    await expect(confirmarImportacion(slug, admin, id, { decisiones })).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });
    await confirmarImportacion(slug, admin, id, { decisiones, categoria: 'Damas' });

    expect((await prisma.categoria.findMany({ where: { organizacionId } })).map((c) => c.nombre)).toEqual(['Damas']);
  });
});
