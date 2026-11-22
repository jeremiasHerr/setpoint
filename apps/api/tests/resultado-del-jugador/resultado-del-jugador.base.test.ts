import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: el resultado que carga un jugador y confirma el rival (decisión 127). Usa la del
// docker compose y se saltea si no hay DATABASE_URL o la base no responde. Crea una organización
// propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('el resultado de los jugadores, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { cargarResultadoDelJugador, confirmarResultadoDelJugador, rechazarResultadoDelJugador, confirmarResultadoPorLaOrganizacion } =
    await import('../../src/modules/resultado-del-jugador/resultado-del-jugador.service');
  const { guardarResultado } = await import('../../src/modules/competencia/resultados.service');
  const { obtenerTablero } = await import('../../src/modules/competencia/tablero.service');
  const { misPartidos } = await import('../../src/modules/jugador/mis-partidos.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-resultados-${marca}`;
  let organizacionId: number;
  let torneoId: number;
  let admin: number;
  // Cuentas de usuario y perfiles del padrón de los tres de la zona.
  const cuenta: Record<'yo' | 'rival' | 'otro', number> = { yo: 0, rival: 0, otro: 0 };
  const perfil: Record<'yo' | 'rival' | 'otro', number> = { yo: 0, rival: 0, otro: 0 };
  // yo contra rival, yo contra otro, rival contra otro.
  const partido: Record<'conRival' | 'conOtro' | 'entreEllos', number> = { conRival: 0, conOtro: 0, entreEllos: 0 };

  const set = (gamesA: number, gamesB: number) => ({ gamesA, gamesB, tieBreakA: null, tieBreakB: null, esSuperTieBreak: false });
  const ganoYo = { tipo: 'jugado' as const, sets: [set(6, 3), set(6, 4)] };
  const ganoElRival = { tipo: 'jugado' as const, sets: [set(2, 6), set(3, 6)] };
  const delPartido = (id: number) => prisma.partido.findUniqueOrThrow({ where: { id }, include: { sets: true } });
  const propuestas = (partidoId: number) =>
    prisma.resultadoPropuesto.findMany({ where: { partidoId }, orderBy: { id: 'asc' }, select: { estado: true, jugadorId: true } });
  const enCuandoJuego = async (quien: 'yo' | 'rival', partidoId: number) =>
    (await misPartidos(slug, cuenta[quien])).partidos!.partidos.find((p) => p.id === partidoId)!;

  beforeAll(async () => {
    if (!conectada) return;
    const org = await prisma.organizacion.create({
      data: { nombre: 'Circuito de prueba', slug, quienCargaResultados: 'ORGANIZACION_Y_JUGADORES' },
    });
    organizacionId = org.id;
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });

    for (const [clave, apellido] of [['yo', 'Bravo'], ['rival', 'Roa'], ['otro', 'Paz']] as const) {
      cuenta[clave] = (await prisma.usuario.create({ data: { email: `${clave}.${marca}@example.com`, nombre: clave, apellido } })).id;
      perfil[clave] = (
        await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: clave, apellido, usuarioId: cuenta[clave] } })
      ).id;
    }

    const torneo = await prisma.torneo.create({
      data: {
        organizacionId,
        categoriaId,
        nombre: 'Copa de prueba',
        estado: 'GRUPOS_EN_CURSO',
        sorteoConfirmado: true,
        cupo: 3,
        precio: 0,
        cantidadGrupos: 1,
        cierreInscripcion: new Date(),
        fechaInicio: new Date(),
        inscripciones: {
          create: (['yo', 'rival', 'otro'] as const).map((clave, i) => ({
            jugadorId: perfil[clave],
            estado: 'PAGADA' as const,
            grupo: 'A',
            posicionSiembra: i + 1,
          })),
        },
      },
    });
    torneoId = torneo.id;
    const crear = (a: number, b: number) =>
      prisma.partido.create({ data: { torneoId, fase: 'GRUPOS', grupo: 'A', jugadorAId: a, jugadorBId: b } }).then((p) => p.id);
    partido.conRival = await crear(perfil.yo, perfil.rival);
    partido.conOtro = await crear(perfil.yo, perfil.otro);
    partido.entreEllos = await crear(perfil.rival, perfil.otro);
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.torneo.deleteMany({ where: { organizacion: { slug } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('el resultado cargado no cuenta hasta que lo confirma el rival', async () => {
    await cargarResultadoDelJugador(slug, cuenta.yo, partido.conRival, ganoYo);

    const guardado = await delPartido(partido.conRival);
    expect(guardado.ganadorId).toBeNull();
    expect(guardado.sets).toHaveLength(0);
    expect((await enCuandoJuego('yo', partido.conRival)).resultadoPropuesto).toMatchObject({
      cargadoPor: 'yo',
      estado: 'pendiente',
      gano: true,
      marcador: '6-3 6-4',
    });
    // El rival lo ve desde su lado, y no puede cargar otro encima.
    const delRival = await enCuandoJuego('rival', partido.conRival);
    expect(delRival.resultadoPropuesto).toMatchObject({ cargadoPor: 'rival', gano: false, marcador: '3-6 4-6' });
    expect(delRival.puedeCargarResultado).toBe(false);
    await expect(cargarResultadoDelJugador(slug, cuenta.rival, partido.conRival, ganoElRival)).rejects.toMatchObject({
      codigo: 'EL_RIVAL_YA_CARGO_EL_RESULTADO',
    });
  });

  it('quien lo cargó lo puede cambiar mientras está pendiente, pero no confirmarlo', async () => {
    await cargarResultadoDelJugador(slug, cuenta.yo, partido.conRival, ganoYo);
    expect((await propuestas(partido.conRival)).map((p) => p.estado)).toEqual(['REEMPLAZADO', 'PENDIENTE']);
    await expect(confirmarResultadoDelJugador(slug, cuenta.yo, partido.conRival)).rejects.toMatchObject({ codigo: 'LO_CARGASTE_VOS' });
  });

  it('el rival lo rechaza: no cuenta, y cualquiera de los dos lo vuelve a cargar', async () => {
    await rechazarResultadoDelJugador(slug, cuenta.rival, partido.conRival);
    expect((await enCuandoJuego('yo', partido.conRival)).resultadoPropuesto).toMatchObject({ estado: 'rechazado' });
    expect((await enCuandoJuego('rival', partido.conRival)).puedeCargarResultado).toBe(true);

    await cargarResultadoDelJugador(slug, cuenta.rival, partido.conRival, ganoElRival);
    expect((await enCuandoJuego('yo', partido.conRival)).resultadoPropuesto).toMatchObject({ cargadoPor: 'rival', estado: 'pendiente' });
  });

  it('la organización lo ve en el tablero', async () => {
    const tablero = await obtenerTablero(slug, admin, torneoId);
    const enElTablero = JSON.stringify(tablero);
    expect(enElTablero).toContain('"resultadoPropuesto":{"cargadoPor":"b","estado":"pendiente","ganador":"b","marcador":"2-6 3-6"}');
  });

  it('confirmado, cuenta como si lo hubiera cargado la organización', async () => {
    await confirmarResultadoDelJugador(slug, cuenta.yo, partido.conRival);

    const guardado = await delPartido(partido.conRival);
    expect(guardado.estado).toBe('JUGADA');
    expect(guardado.ganadorId).toBe(perfil.rival);
    expect(guardado.sets.map((s) => [s.gamesA, s.gamesB])).toEqual([
      [2, 6],
      [3, 6],
    ]);
    expect((await propuestas(partido.conRival)).at(-1)!.estado).toBe('CONFIRMADO');
    const enLaApp = await enCuandoJuego('yo', partido.conRival);
    expect(enLaApp.resultado).toEqual({ gano: false, marcador: '2-6 3-6' });
    expect(enLaApp.resultadoPropuesto).toBeNull();
    expect(enLaApp.puedeCargarResultado).toBe(false);
  });

  it('si el rival no responde, lo confirma la organización', async () => {
    await cargarResultadoDelJugador(slug, cuenta.yo, partido.conOtro, { tipo: 'abandono', ganadorId: perfil.yo });
    await confirmarResultadoPorLaOrganizacion(slug, admin, torneoId, partido.conOtro);

    const guardado = await delPartido(partido.conOtro);
    expect(guardado.estado).toBe('ABANDONO');
    expect(guardado.ganadorId).toBe(perfil.yo);
  });

  it('si la organización carga el resultado, el pendiente queda reemplazado', async () => {
    await cargarResultadoDelJugador(slug, cuenta.rival, partido.entreEllos, ganoYo);
    await guardarResultado(slug, admin, torneoId, partido.entreEllos, ganoElRival);

    expect((await propuestas(partido.entreEllos)).map((p) => p.estado)).toEqual(['REEMPLAZADO']);
    expect((await delPartido(partido.entreEllos)).ganadorId).toBe(perfil.otro);
  });

  it('con la carga solo de la organización, el jugador no puede cargar', async () => {
    await prisma.organizacion.update({ where: { id: organizacionId }, data: { quienCargaResultados: 'ORGANIZACION' } });
    const nuevo = await prisma.partido.create({
      data: { torneoId, fase: 'GRUPOS', grupo: 'A', jugadorAId: perfil.yo, jugadorBId: perfil.rival },
    });

    expect((await enCuandoJuego('yo', nuevo.id)).puedeCargarResultado).toBe(false);
    await expect(cargarResultadoDelJugador(slug, cuenta.yo, nuevo.id, ganoYo)).rejects.toMatchObject({
      estado: 403,
      codigo: 'LA_ORGANIZACION_CARGA_LOS_RESULTADOS',
    });
  });

  it('un W.O. tampoco: lo decide la organización', async () => {
    // El schema de la ruta lo rechaza antes; el servicio también, por el tipo de dato.
    const { resultadoDelJugadorSchema } = await import('@setpoint/shared');
    expect(resultadoDelJugadorSchema.safeParse({ tipo: 'walkover', ganadorId: perfil.yo }).success).toBe(false);
  });
});
