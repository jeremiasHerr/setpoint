import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: el listado del inicio con un torneo en juego y uno cerrado (decisión 080). Usa la
// del docker compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no
// responde. Crea una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('el inicio con torneos en juego y terminados, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { listarConvocatorias } = await import('../../src/modules/torneos/torneos.service');
  const { cerrarTorneo } = await import('../../src/modules/competencia/cierre.service');
  const { hoy } = await import('../../src/lib/fechas');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-inicio-${marca}`;
  let admin: number;
  let enJuegoId: number;
  let aCerrarId: number;

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    const { id: etapaId } = await prisma.etapa.create({ data: { organizacionId, nombre: 'Primavera', orden: 1 } });
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });

    const jugador = async (apellido: string) =>
      (await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Jugador', apellido } })).id;
    const [bravo, vera, ojeda, rivas] = [await jugador('Bravo'), await jugador('Vera'), await jugador('Ojeda'), await jugador('Rivas')];
    const torneo = async (nombre: string, estado: 'GRUPOS_EN_CURSO' | 'ELIMINATORIAS', jugadores: number[], etapa?: number) =>
      (
        await prisma.torneo.create({
          data: {
            organizacionId,
            categoriaId,
            etapaId: etapa,
            nombre,
            cupo: 4,
            estado,
            sorteoConfirmado: true,
            gruposCerrados: estado === 'ELIMINATORIAS',
            inscripciones: { create: jugadores.map((jugadorId) => ({ jugadorId, estado: 'PAGADA' as const })) },
          },
        })
      ).id;

    // En las zonas: uno jugado y uno que venció sin resultado.
    enJuegoId = await torneo('Copa en juego', 'GRUPOS_EN_CURSO', [bravo, vera, ojeda, rivas], etapaId);
    await prisma.partido.createMany({
      data: [
        { torneoId: enJuegoId, fase: 'GRUPOS', grupo: 'A', jugadorAId: bravo, jugadorBId: vera, ganadorId: bravo, estado: 'JUGADA' },
        { torneoId: enJuegoId, fase: 'GRUPOS', grupo: 'A', jugadorAId: ojeda, jugadorBId: rivas, fechaLimite: new Date('2026-01-10T00:00:00.000Z') },
      ],
    });

    // Con la final del cuadro principal jugada, lista para cerrar.
    aCerrarId = await torneo('Copa a cerrar', 'ELIMINATORIAS', [bravo, vera]);
    await prisma.partido.create({
      data: { torneoId: aCerrarId, fase: 'ELIMINATORIA', cuadro: 'CAMPEONATO', ronda: 1, ordenEnRonda: 1, jugadorAId: bravo, jugadorBId: vera, ganadorId: vera, estado: 'JUGADA' },
    });
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  const delListado = async (torneoId: number) =>
    (await listarConvocatorias(slug, admin)).flatMap((c) => c.torneos).find((t) => t.id === torneoId)!;

  it('un torneo en zonas trae su avance, contado como en el tablero, y no está terminado', async () => {
    const torneo = await delListado(enJuegoId);
    expect(torneo.avance).toMatchObject({ fase: 'zonas', partidos: 2, jugados: 1, vencidos: 1, ronda: null });
    expect(torneo.terminado).toBeNull();
  });

  it('cada convocatoria dice su torneo del calendario, para la etiqueta de su tarjeta', async () => {
    const convocatorias = await listarConvocatorias(slug, admin);
    const de = (torneoId: number) => convocatorias.find((c) => c.torneos.some((t) => t.id === torneoId))!;
    expect(de(enJuegoId)).toMatchObject({ etapa: 'Primavera', suelto: false });
    expect(de(aCerrarId)).toMatchObject({ etapa: null, suelto: false });
  });

  it('al cerrar, guarda la fecha, y el listado lo trae terminado con el campeón del cuadro principal', async () => {
    expect((await delListado(aCerrarId)).avance).toMatchObject({ fase: 'cuadros', partidos: 1, jugados: 1 });

    await cerrarTorneo(slug, admin, aCerrarId);

    const torneo = await delListado(aCerrarId);
    expect(torneo.avance).toBeNull();
    expect(torneo.terminado).toEqual({ cerradoEl: hoy(), campeon: { nombre: 'Jugador', apellido: 'Vera' } });
  });
});
