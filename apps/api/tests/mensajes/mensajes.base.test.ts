import { afterAll, beforeAll, describe, expect, it as base, vi } from 'vitest';

// Contra Postgres: los resultados desde los mensajes (F19, decisión 119). La IA se reemplaza por
// respuestas fijas; todo lo demás es real: la auditoría, el guardado con guardarResultado y la
// lectura que queda en la base. Crea una organización propia y la borra al terminar.

const { intentarJson } = vi.hoisted(() => ({ intentarJson: vi.fn() }));
vi.mock('../../src/lib/ia', async (original) => ({ ...(await original<typeof import('../../src/lib/ia')>()), intentarJson }));

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('los resultados desde los mensajes, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { decidirResultado, leerMensajes, obtenerLectura } = await import('../../src/modules/competencia/mensajes/mensajes.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-mensajes-${marca}`;
  let admin: number;
  let torneoId: number;
  const ids = { antileo: 0, sanhueza: 0, paz: 0 };
  const partidos = { antileoSanhueza: 0, sanhuezaPaz: 0 };

  const CHAT = [
    '[20/11/26, 18:03:12] Diego Antileo: Perdí con Sanhueza 46 36',
    '[20/11/26, 18:10:01] Juan Paz: ¿alguien juega el jueves?',
    '[20/11/26, 19:00:45] Martín Sanhueza: Le gané a Paz 6-2 6-1',
  ].join('\n');

  const respuesta = (resultados: object[]) => ({ ok: true, datos: { resultados }, crudo: '{}', tokens: { entrada: 100, salida: 50 } });

  beforeAll(async () => {
    if (!conectada) return;
    admin = (await prisma.usuario.create({ data: { email: `admin.${marca}@example.com`, nombre: 'Admin', apellido: '' } })).id;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito', slug, usaRanking: false } });
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 0 } });
    const jugador = (nombre: string, apellido: string) => prisma.jugador.create({ data: { organizacionId, categoriaId, nombre, apellido } }).then((j) => j.id);
    ids.antileo = await jugador('Diego', 'Antileo');
    ids.sanhueza = await jugador('Martín', 'Sanhueza');
    ids.paz = await jugador('Juan', 'Paz');

    torneoId = (
      await prisma.torneo.create({
        data: { organizacionId, categoriaId, nombre: 'Primavera', edicion: 'Primavera 2026', cupo: 4, cantidadGrupos: 1, clasificanPorGrupo: 2, estado: 'GRUPOS_EN_CURSO', sorteoConfirmado: true },
      })
    ).id;
    await prisma.inscripcion.createMany({
      data: Object.values(ids).map((jugadorId, i) => ({ torneoId, jugadorId, estado: 'PAGADA' as const, grupo: 'A', posicionSiembra: i + 1 })),
    });
    const partido = (a: number, b: number) =>
      prisma.partido.create({ data: { torneoId, fase: 'GRUPOS', grupo: 'A', jugadorAId: a, jugadorBId: b } }).then((p) => p.id);
    partidos.antileoSanhueza = await partido(ids.antileo, ids.sanhueza);
    partidos.sanhuezaPaz = await partido(ids.sanhueza, ids.paz);
    await partido(ids.antileo, ids.paz);
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneoId } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('carga solo lo que pasa los controles, deja lo dudoso con su motivo, y la organización lo decide', async () => {
    intentarJson.mockResolvedValueOnce(
      respuesta([
        { mensaje: 1, partidoId: partidos.antileoSanhueza, tipo: 'jugado', ganador: 'B', sets: [{ gamesA: 4, gamesB: 6, esSuperTieBreak: false }, { gamesA: 3, gamesB: 6, esSuperTieBreak: false }], confianza: 'alta' },
        { mensaje: 3, partidoId: partidos.sanhuezaPaz, tipo: 'jugado', ganador: 'A', sets: [{ gamesA: 6, gamesB: 2, esSuperTieBreak: false }, { gamesA: 6, gamesB: 1, esSuperTieBreak: false }], confianza: 'media' },
      ]),
    );

    const lectura = await leerMensajes(slug, admin, torneoId, CHAT);
    expect(lectura).toMatchObject({ estado: 'PROCESADO', mensajes: 3, nombre: 'Primavera 2026 · Tercera' });
    expect(lectura.resultados.map((r) => [r.n, r.remitente, r.estado, r.motivo])).toEqual([
      [1, 'Diego Antileo', 'cargado', null],
      [2, 'Martín Sanhueza', 'a_revisar', 'No es seguro cómo se leyó el mensaje'],
    ]);
    const cargado = await prisma.partido.findUniqueOrThrow({ where: { id: partidos.antileoSanhueza }, include: { sets: true } });
    expect(cargado).toMatchObject({ estado: 'JUGADA', ganadorId: ids.sanhueza });
    expect(cargado.sets).toHaveLength(2);
    expect(await prisma.partido.findUniqueOrThrow({ where: { id: partidos.sanhuezaPaz } })).toMatchObject({ ganadorId: null });

    const decidida = await decidirResultado(slug, admin, torneoId, lectura.id, 2, 'cargar');
    expect(decidida.resultados[1]).toMatchObject({ estado: 'cargado', cargadoAMano: true });
    expect(decidida.resultados[1].partido).toMatchObject({ estado: 'jugada', ganadorId: ids.sanhueza });
    await expect(decidirResultado(slug, admin, torneoId, lectura.id, 2, 'descartar')).rejects.toMatchObject({ codigo: 'RESULTADO_YA_DECIDIDO' });

    // Volver a pegar los mismos mensajes no carga nada dos veces.
    intentarJson.mockResolvedValueOnce(
      respuesta([
        { mensaje: 1, partidoId: partidos.antileoSanhueza, tipo: 'jugado', ganador: 'B', sets: [{ gamesA: 4, gamesB: 6, esSuperTieBreak: false }, { gamesA: 3, gamesB: 6, esSuperTieBreak: false }], confianza: 'alta' },
      ]),
    );
    const otra = await leerMensajes(slug, admin, torneoId, CHAT);
    expect(otra.resultados.map((r) => r.estado)).toEqual(['ya_estaba']);
  });

  it('reintenta una vez si la IA habla de un partido que no existe, y si vuelve a fallar no carga nada', async () => {
    const inventado = { mensaje: 1, partidoId: 999999, tipo: 'jugado', ganador: 'A', sets: [], confianza: 'alta' };
    intentarJson.mockResolvedValueOnce(respuesta([inventado])).mockResolvedValueOnce(respuesta([inventado]));

    const lectura = await leerMensajes(slug, admin, torneoId, CHAT);
    expect(lectura.estado).toBe('ERROR');
    expect(lectura.error).toMatch(/no están en la lista/);
    expect(intentarJson.mock.calls.at(-1)![2]).toMatch(/Tu respuesta anterior tuvo estos problemas/);
    expect((await obtenerLectura(slug, admin, torneoId, lectura.id)).resultados).toEqual([]);
  });

  it('un torneo de otra organización no se encuentra', async () => {
    const otra = await prisma.organizacion.create({ data: { nombre: 'Otro', slug: `${slug}-otra` } });
    await prisma.adminOrganizacion.create({ data: { organizacionId: otra.id, usuarioId: admin } });
    await expect(leerMensajes(`${slug}-otra`, admin, torneoId, CHAT)).rejects.toMatchObject({ codigo: 'TORNEO_NO_ENCONTRADO' });
  });
});
