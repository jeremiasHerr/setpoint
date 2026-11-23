import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: la siembra que ordena a mano la organización en un torneo sin ranking
// (decisión 133). Usa la del docker compose (`docker compose up -d db`) y se saltea si no hay
// DATABASE_URL o la base no responde. Crea una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la siembra a mano, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { obtenerSorteo, ordenarSiembraAMano, sortear } = await import('../../src/modules/competencia/sorteo.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-siembra-${marca}`;
  let organizacionId: number;
  let categoriaId: number;
  let admin: number;
  let torneoId: number;
  let jugadores: number[] = [];

  beforeAll(async () => {
    if (!conectada) return;
    ({ id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug, usaRanking: false } }));
    ({ id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } }));
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });

    for (const apellido of ['Bravo', 'Vera', 'Ojeda', 'Rivas', 'Paz', 'Sosa']) {
      jugadores.push((await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Jugador', apellido } })).id);
    }
    torneoId = (
      await prisma.torneo.create({
        data: {
          organizacionId,
          categoriaId,
          nombre: 'Copa sin ranking',
          cupo: 8,
          cantidadGrupos: 2,
          estado: 'INSCRIPCIONES_CERRADAS',
          inscripciones: { create: jugadores.map((jugadorId) => ({ jugadorId, estado: 'PAGADA' as const })) },
        },
      })
    ).id;
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('sin ranking se puede ordenar a mano, y arranca al azar', async () => {
    expect(await obtenerSorteo(slug, admin, torneoId)).toMatchObject({ siembraAMano: true, siembraManual: false });
  });

  it('si no están todos los inscriptos, una vez cada uno, no se guarda', async () => {
    await expect(ordenarSiembraAMano(slug, admin, torneoId, { jugadorIds: jugadores.slice(1) })).rejects.toMatchObject({
      codigo: 'SORTEO_DESACTUALIZADO',
    });
    const repetido = [...jugadores.slice(1), jugadores[1]];
    await expect(ordenarSiembraAMano(slug, admin, torneoId, { jugadorIds: repetido })).rejects.toMatchObject({
      codigo: 'SORTEO_DESACTUALIZADO',
    });
  });

  it('el sorteo usa el orden guardado, aunque se pida volver a sortear', async () => {
    const orden = [...jugadores].reverse();
    const ordenado = await ordenarSiembraAMano(slug, admin, torneoId, { jugadorIds: orden });
    expect(ordenado.siembraManual).toBe(true);
    expect(ordenado.zonas).toBeNull();
    expect(ordenado.jugadores.map((j) => j.jugadorId)).toEqual(orden);

    // En serpentina con 2 zonas: la A recibe al 1, al 4 y al 5 de la siembra.
    const sorteado = await sortear(slug, admin, torneoId, { modoDistribucion: 'serpentina', nuevaSiembra: true, modoSorteo: 'automatico' });
    expect(sorteado.zonas?.[0].integrantes.map((j) => j.jugadorId)).toEqual([orden[0], orden[3], orden[4]]);
  });

  it('si entró alguien después de ordenarla, hay que ordenarla de nuevo', async () => {
    const nuevo = (await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Jugador', apellido: 'Luna' } })).id;
    const inscripcion = await prisma.inscripcion.create({ data: { torneoId, jugadorId: nuevo, estado: 'PAGADA' } });

    await expect(sortear(slug, admin, torneoId, { modoDistribucion: 'serpentina', nuevaSiembra: false, modoSorteo: 'automatico' })).rejects.toMatchObject({
      codigo: 'SIEMBRA_DESACTUALIZADA',
    });
    await prisma.inscripcion.delete({ where: { id: inscripcion.id } });
  });

  it('con null vuelve al azar y se borran las posiciones', async () => {
    const sorteo = await ordenarSiembraAMano(slug, admin, torneoId, { jugadorIds: null });
    expect(sorteo.siembraManual).toBe(false);
    expect(sorteo.jugadores.every((j) => j.posicionSiembra === null)).toBe(true);
  });

  it('con ranking, la siembra es el ranking: no se ordena a mano', async () => {
    await prisma.organizacion.update({ where: { id: organizacionId }, data: { usaRanking: true } });
    expect((await obtenerSorteo(slug, admin, torneoId)).siembraAMano).toBe(false);
    await expect(ordenarSiembraAMano(slug, admin, torneoId, { jugadorIds: jugadores })).rejects.toMatchObject({
      codigo: 'SIEMBRA_CON_RANKING',
    });
    await prisma.organizacion.update({ where: { id: organizacionId }, data: { usaRanking: false } });
  });
});
