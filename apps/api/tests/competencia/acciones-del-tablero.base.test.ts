import { afterAll, beforeAll, describe, expect, it as base, vi } from 'vitest';

// Contra Postgres: las acciones del tablero (decisión 135). Extender el plazo de un partido,
// recordarles a los dos jugadores y el doble W.O., que se carga como un resultado más. Usa la base
// del docker compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o la base no
// responde. Crea una organización propia y la borra al terminar.

const correos = vi.hoisted(() => [] as { para: string; asunto: string }[]);
const avisos = vi.hoisted(() => [] as { usuarioId: number }[][]);
vi.mock('../../src/lib/correo', () => ({ enviarCorreo: vi.fn(async (c: { para: string; asunto: string }) => void correos.push(c)) }));
vi.mock('../../src/modules/avisos/avisos.service', () => ({
  enviarAvisos: vi.fn(async (a: { usuarioId: number }[]) => void avisos.push(a)),
  avisarFixture: vi.fn(async () => {}),
}));

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('las acciones del tablero, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { extenderPlazo, recordarPartido } = await import('../../src/modules/competencia/acciones-del-tablero.service');
  const { guardarResultado } = await import('../../src/modules/competencia/resultados.service');
  const { hoy } = await import('../../src/lib/fechas');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-tablero-${marca}`;
  const ids = {} as Record<'admin' | 'torneo' | 'pendiente' | 'otro' | 'jugado' | 'deCuadro' | 'conApp' | 'conCuenta', number>;
  const enDias = (dias: number) => {
    const fecha = new Date(`${hoy()}T00:00:00.000Z`);
    fecha.setUTCDate(fecha.getUTCDate() + dias);
    return fecha;
  };
  const dia = (dias: number) => enDias(dias).toISOString().slice(0, 10);

  beforeAll(async () => {
    if (!conectada) return;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    const usuario = async (nombre: string) =>
      (await prisma.usuario.create({ data: { email: `${nombre}.${marca}@example.com`, nombre, apellido: '' } })).id;
    ids.admin = await usuario('admin');
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: ids.admin } });
    // Bravo tiene la app; Vera tiene cuenta pero no la app; Ojeda y Rivas, ninguna de las dos.
    ids.conApp = await usuario('bravo');
    ids.conCuenta = await usuario('vera');
    await prisma.dispositivoAviso.create({ data: { usuarioId: ids.conApp, token: `ExponentPushToken[${marca}]` } });

    const jugador = async (apellido: string, usuarioId: number | null = null) =>
      (await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Jugador', apellido, usuarioId } })).id;
    const [bravo, vera, ojeda, rivas] = [await jugador('Bravo', ids.conApp), await jugador('Vera', ids.conCuenta), await jugador('Ojeda'), await jugador('Rivas')];

    ids.torneo = (
      await prisma.torneo.create({
        data: {
          organizacionId,
          categoriaId,
          nombre: 'Copa del tablero',
          cupo: 4,
          cantidadGrupos: 1,
          estado: 'GRUPOS_EN_CURSO',
          sorteoConfirmado: true,
          inscripciones: {
            create: [bravo, vera, ojeda, rivas].map((jugadorId, i) => ({ jugadorId, estado: 'PAGADA' as const, grupo: 'A', posicionSiembra: i + 1 })),
          },
        },
      })
    ).id;
    const partido = async (datos: object) => (await prisma.partido.create({ data: { torneoId: ids.torneo, ...datos } })).id;
    const deZona = { fase: 'GRUPOS' as const, grupo: 'A', fechaLimite: enDias(2) };
    ids.pendiente = await partido({ ...deZona, jugadorAId: bravo, jugadorBId: vera });
    ids.otro = await partido({ ...deZona, jugadorAId: ojeda, jugadorBId: rivas });
    ids.jugado = await partido({ ...deZona, jugadorAId: bravo, jugadorBId: ojeda, ganadorId: bravo, estado: 'WALKOVER' });
    ids.deCuadro = await partido({ fase: 'ELIMINATORIA', cuadro: 'CAMPEONATO', ronda: 1, ordenEnRonda: 1, jugadorAId: vera, jugadorBId: rivas });
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('el plazo se extiende hacia adelante y queda en el historial', async () => {
    await expect(extenderPlazo(slug, ids.admin, ids.torneo, ids.pendiente, { fechaLimite: dia(-1) })).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });
    await expect(extenderPlazo(slug, ids.admin, ids.torneo, ids.pendiente, { fechaLimite: dia(1) })).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });

    await extenderPlazo(slug, ids.admin, ids.torneo, ids.pendiente, { fechaLimite: dia(5) });
    const partido = await prisma.partido.findUniqueOrThrow({ where: { id: ids.pendiente }, include: { eventos: true } });
    expect(partido.fechaLimite?.toISOString().slice(0, 10)).toBe(dia(5));
    expect(partido.eventos).toEqual([expect.objectContaining({ tipo: 'PLAZO_EXTENDIDO', porOrganizacion: true, usuarioId: ids.admin })]);
  });

  it('un partido con resultado no se extiende ni se recuerda', async () => {
    await expect(extenderPlazo(slug, ids.admin, ids.torneo, ids.jugado, { fechaLimite: dia(5) })).rejects.toMatchObject({ codigo: 'PARTIDO_CON_RESULTADO' });
    await expect(recordarPartido(slug, ids.admin, ids.torneo, ids.jugado)).rejects.toMatchObject({ codigo: 'PARTIDO_CON_RESULTADO' });
  });

  it('el recordatorio llega por aviso a quien tiene la app y por email a quien tiene cuenta', async () => {
    expect(await recordarPartido(slug, ids.admin, ids.torneo, ids.pendiente)).toEqual({ conAviso: ['Bravo'], conEmail: ['Bravo', 'Vera'], sinCanal: [] });
    expect(avisos.at(-1)).toEqual([expect.objectContaining({ usuarioId: ids.conApp })]);
    expect(correos.map((c) => c.para)).toEqual([`bravo.${marca}@example.com`, `vera.${marca}@example.com`]);

    // Ojeda y Rivas no tienen cuenta: quedan para "Escribirles".
    expect(await recordarPartido(slug, ids.admin, ids.torneo, ids.otro)).toEqual({ conAviso: [], conEmail: [], sinCanal: ['Ojeda', 'Rivas'] });
  });

  it('el doble W.O. se guarda sin ganador, y en un cuadro no se puede', async () => {
    await guardarResultado(slug, ids.admin, ids.torneo, ids.otro, { tipo: 'doble_walkover' });
    expect(await prisma.partido.findUniqueOrThrow({ where: { id: ids.otro } })).toMatchObject({ estado: 'DOBLE_WALKOVER', ganadorId: null });

    await expect(guardarResultado(slug, ids.admin, ids.torneo, ids.deCuadro, { tipo: 'doble_walkover' })).rejects.toMatchObject({
      codigo: 'DOBLE_WALKOVER_EN_CUADRO',
    });
  });
});
