import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: la proyección pública de un jugador en un torneo (F20). Usa la del docker compose
// (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no responde. Crea una
// organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la proyección de ranking, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { proyeccionPublica } = await import('../../src/modules/proyeccion/proyeccion-publica.service');

  const slug = `prueba-proyeccion-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  let torneoId: number;
  let bravo: number;
  let vera: number;
  let roa: number;

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug, usaRanking: true } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    const { id: etapaId } = await prisma.etapa.create({ data: { organizacionId, nombre: 'Otoño', orden: 1 } });
    await prisma.puntajeInstancia.createMany({
      data: [
        { organizacionId, instancia: 'CAMPEON', puntos: 100 },
        { organizacionId, instancia: 'FINALISTA', puntos: 75 },
        { organizacionId, instancia: 'SEMIFINALISTA', puntos: 50 },
        { organizacionId, instancia: 'PARTICIPACION', puntos: 10 },
      ],
    });
    const jugador = (nombre: string, apellido: string) =>
      prisma.jugador.create({ data: { organizacionId, categoriaId, nombre, apellido } }).then((j) => j.id);
    [bravo, vera, roa] = [await jugador('Lucas', 'Bravo'), await jugador('Pablo', 'Vera'), await jugador('Javier', 'Roa')];

    // Otoño 25: Roa sacó 40 y Bravo, 15. Roa no juega Otoño 26.
    const otono25 = { organizacionId, categoriaId, etapaId, motivo: 'IMPORTACION_INICIAL', fecha: new Date('2025-01-01') } as const;
    await prisma.movimientoRanking.createMany({
      data: [
        { ...otono25, jugadorId: roa, puntos: 40 },
        { ...otono25, jugadorId: bravo, puntos: 15 },
      ],
    });

    // 2 zonas y 2 clasificados por zona: un cuadro principal de 4, con semifinales y final.
    const torneo = { organizacionId, categoriaId, nombre: 'Otoño', cupo: 8, cantidadGrupos: 2, clasificanPorGrupo: 2 } as const;
    torneoId = (await prisma.torneo.create({ data: { ...torneo, etapaId, edicion: 'Otoño 2026', estado: 'PUBLICADO' } })).id;
    await prisma.inscripcion.createMany({
      data: [
        { torneoId, jugadorId: bravo, estado: 'PAGADA' },
        { torneoId, jugadorId: vera, estado: 'PAGADA' },
        { torneoId, jugadorId: roa, estado: 'PENDIENTE_PAGO' },
      ],
    });
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.torneo.deleteMany({ where: { organizacion: { slug } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
  });

  it('antes del sorteo proyecta con el formato publicado, de participación a campeón', async () => {
    const proyeccion = await proyeccionPublica(slug, torneoId, bravo);

    expect(proyeccion).toMatchObject({
      torneo: 'Otoño 2026 · Tercera',
      torneoDelCalendario: 'Otoño',
      apellido: 'Bravo',
      situacion: null,
      hoy: { puntos: 15, puesto: 2 },
      defiende: { puntos: 15, anio: 2025 },
      definido: false,
    });
    // Los 15 de Otoño 25 se reemplazan. Roa no juega y sigue con sus 40; Vera tiene asegurados 10.
    expect(proyeccion.escenarios).toEqual([
      { instancia: 'participacion', puntos: 10, acumulado: 10, puesto: 2 },
      { instancia: 'semifinalista', puntos: 50, acumulado: 50, puesto: 1 },
      { instancia: 'finalista', puntos: 75, acumulado: 75, puesto: 1 },
      { instancia: 'campeon', puntos: 100, acumulado: 100, puesto: 1 },
    ]);
    expect(proyeccion.numeroUno).toEqual({
      desde: 'semifinalista',
      rival: { jugadorId: roa, nombre: 'Javier', apellido: 'Roa', puntos: 40, asegurada: null, sigueEnJuego: false },
    });
  });

  it('quien no pagó todavía no juega el torneo', async () => {
    await expect(proyeccionPublica(slug, torneoId, roa)).rejects.toMatchObject({ estado: 404, codigo: 'JUGADOR_NO_ENCONTRADO' });
  });

  it('un torneo suelto no da puntos, y un borrador no se publica', async () => {
    const { organizacionId, categoriaId, etapaId } = await prisma.torneo.findUniqueOrThrow({ where: { id: torneoId } });
    const datos = { organizacionId, categoriaId, cupo: 8 };
    const suelto = await prisma.torneo.create({ data: { ...datos, nombre: 'Copa de verano', estado: 'PUBLICADO' } });
    const borrador = await prisma.torneo.create({ data: { ...datos, etapaId, nombre: 'Otoño 2027' } });

    await expect(proyeccionPublica(slug, suelto.id, bravo)).rejects.toMatchObject({ estado: 409, codigo: 'TORNEO_SIN_RANKING' });
    await expect(proyeccionPublica(slug, borrador.id, bravo)).rejects.toMatchObject({ estado: 404, codigo: 'TORNEO_NO_ENCONTRADO' });
  });

  it('con los cuadros armados, parte de la ronda que le toca jugar a cada uno', async () => {
    // Las zonas se cerraron y Bravo y Vera juegan la final del cuadro principal.
    await prisma.inscripcion.updateMany({ where: { torneoId, estado: 'PAGADA' }, data: { grupo: 'A', posicionSiembra: 1 } });
    await prisma.torneo.update({ where: { id: torneoId }, data: { estado: 'ELIMINATORIAS', sorteoConfirmado: true, gruposCerrados: true } });
    const final = await prisma.partido.create({
      data: { torneoId, fase: 'ELIMINATORIA', cuadro: 'CAMPEONATO', ronda: 1, ordenEnRonda: 1, jugadorAId: bravo, jugadorBId: vera },
    });

    const enLaFinal = await proyeccionPublica(slug, torneoId, bravo);
    expect(enLaFinal.situacion).toEqual({ tipo: 'cuadro', cuadro: 'campeonato', ronda: 1, rondas: 1, campeon: false, enJuego: true });
    // Vera también tiene asegurados los 75 del finalista: empata con Bravo si Bravo pierde.
    expect(enLaFinal.escenarios).toEqual([
      { instancia: 'finalista', puntos: 75, acumulado: 75, puesto: 1 },
      { instancia: 'campeon', puntos: 100, acumulado: 100, puesto: 1 },
    ]);
    expect(enLaFinal.numeroUno.rival).toMatchObject({ jugadorId: vera, puntos: 75, asegurada: 'finalista', sigueEnJuego: true });

    await prisma.partido.update({ where: { id: final.id }, data: { estado: 'JUGADA', ganadorId: vera } });
    const perdio = await proyeccionPublica(slug, torneoId, bravo);
    expect(perdio.definido).toBe(true);
    // Vera salió campeón: 100.
    expect(perdio.escenarios).toEqual([{ instancia: 'finalista', puntos: 75, acumulado: 75, puesto: 2 }]);
  });

  it('cerrado el torneo ya no hay proyección', async () => {
    await prisma.torneo.update({ where: { id: torneoId }, data: { estado: 'FINALIZADO' } });
    await expect(proyeccionPublica(slug, torneoId, bravo)).rejects.toMatchObject({ estado: 409, codigo: 'TORNEO_CERRADO' });
  });
});
