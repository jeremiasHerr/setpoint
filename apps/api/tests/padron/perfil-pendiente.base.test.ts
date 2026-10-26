import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: el filtro del padrón vive en las consultas, así que se prueba con la base
// (decisión 054). Usa la del docker compose (`docker compose up -d db`) y se saltea si no hay
// DATABASE_URL o la base no responde. Crea una organización propia y la borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('perfil pendiente, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  // Con DATABASE_URL pero la base apagada, también se saltea.
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { buscarEnElPadron, inscribirComoNuevo } = await import('../../src/modules/inscripcion/inscripcion.service');
  const { rankingPublico } = await import('../../src/modules/ranking/ranking-publico.service');
  const { linkPersonal } = await import('../../src/modules/link-personal/link-personal.service');
  const { perfilesDe } = await import('../../src/modules/auth/auth.service');
  const { cuentaDe } = await import('../../src/modules/auth/cuenta.service');
  const { padronDe } = await import('../../src/modules/jugadores/jugadores.service');
  const { vencerReservas } = await import('../../src/modules/pagos/vencimiento');
  const { rechazarSolicitud } = await import('../../src/modules/inscripciones/inscripciones.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-pendiente-${marca}`;
  let organizacionId: number;
  let abierto: number;
  let conAprobacion: number;
  let admin: number;
  let nuevo: number;
  let solicitante: number;

  beforeAll(async () => {
    if (!conectada) return;
    const organizacion = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    organizacionId = organizacion.id;
    const categoria = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 1 } });
    const otra = await prisma.categoria.create({ data: { organizacionId, nombre: 'Segunda', orden: 2 } });
    const torneo = { organizacionId, nombre: 'Abierto de prueba', cupo: 8, estado: 'PUBLICADO' as const };
    abierto = (await prisma.torneo.create({ data: { ...torneo, categoriaId: categoria.id, modoInscripcion: 'ABIERTA' } })).id;
    conAprobacion = (await prisma.torneo.create({ data: { ...torneo, categoriaId: otra.id, modoInscripcion: 'CON_APROBACION' } })).id;
    await prisma.jugador.create({ data: { organizacionId, categoriaId: categoria.id, nombre: 'Ana', apellido: 'Gómez' } });

    const usuario = (email: string) => prisma.usuario.create({ data: { email: `${email}.${marca}@example.com`, nombre: '', apellido: '' } });
    admin = (await usuario('admin')).id;
    nuevo = (await usuario('nuevo')).id;
    solicitante = (await usuario('solicitante')).id;
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
  });

  afterAll(async () => {
    if (!conectada) return;
    // Las inscripciones primero: apuntan a los jugadores, que se borran con la organización.
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('el perfil pendiente no aparece en la búsqueda, el ranking, el padrón ni los circuitos', async () => {
    const reserva = await inscribirComoNuevo(slug, abierto, nuevo, { nombre: 'Bruno', apellido: 'Gómez' });
    expect(reserva.estado).toBe('reservando');

    const busqueda = await buscarEnElPadron(slug, abierto, 'Gómez');
    expect(busqueda.perfiles.map((p) => p.nombre)).toEqual(['Ana']);

    const ranking = await rankingPublico(slug);
    const nombres = ranking.categorias.flatMap((c) => c.filas.map((f) => f.nombre));
    expect(nombres).toContain('Ana');
    expect(nombres).not.toContain('Bruno');

    expect((await padronDe(organizacionId)).map((j) => j.nombre)).toEqual(['Ana']);
    expect(await perfilesDe(nuevo)).toEqual([]);

    const cuenta = await cuentaDe(nuevo);
    expect(cuenta.enCurso.map((i) => i.estado)).toEqual(['reservando']);
  });

  it('el link personal de un perfil pendiente no anda', async () => {
    const pendiente = await prisma.jugador.findFirstOrThrow({ where: { organizacionId, usuarioId: nuevo } });
    await prisma.jugador.update({ where: { id: pendiente.id }, data: { codigoLink: `pendiente${marca}`.slice(0, 16).padEnd(16, 'x') } });
    const codigo = (await prisma.jugador.findUniqueOrThrow({ where: { id: pendiente.id } })).codigoLink!;
    await expect(linkPersonal(codigo)).rejects.toMatchObject({ codigo: 'LINK_NO_ENCONTRADO' });
  });

  it('al vencer la reserva, el perfil se descarta, la inscripción lo conserva y la cuenta queda libre', async () => {
    const pendiente = await prisma.jugador.findFirstOrThrow({ where: { organizacionId, usuarioId: nuevo } });
    await vencerReservas(new Date(Date.now() + 60 * 60 * 1000));

    const descartado = await prisma.jugador.findUniqueOrThrow({ where: { id: pendiente.id } });
    expect(descartado.estado).toBe('DESCARTADO');
    expect(descartado.usuarioId).toBeNull();

    const inscripcion = await prisma.inscripcion.findFirstOrThrow({ where: { jugadorId: pendiente.id } });
    expect(inscripcion).toMatchObject({ estado: 'EXPIRADA', usuarioId: nuevo });

    const cuenta = await cuentaDe(nuevo);
    expect(cuenta.enCurso).toEqual([]);
    expect(cuenta.avisos.map((a) => a.motivo)).toEqual(['vencida']);

    // Puede volver a inscribirse: el descartado no ocupa su lugar de un perfil por organización.
    const otra = await inscribirComoNuevo(slug, abierto, nuevo, { nombre: 'Bruno', apellido: 'Gómez' });
    expect(otra.estado).toBe('reservando');
    expect((await cuentaDe(nuevo)).avisos).toEqual([]);
  });

  it('una solicitud rechazada descarta el perfil y queda el aviso', async () => {
    const solicitud = await inscribirComoNuevo(slug, conAprobacion, solicitante, { nombre: 'Carla', apellido: 'Paz' });
    expect(solicitud).toMatchObject({ estado: 'solicitada', reservaVence: null });
    expect((await cuentaDe(solicitante)).enCurso.map((i) => i.estado)).toEqual(['solicitada']);

    await rechazarSolicitud(slug, admin, conAprobacion, solicitud.inscripcionId);

    const inscripcion = await prisma.inscripcion.findUniqueOrThrow({ where: { id: solicitud.inscripcionId }, include: { jugador: true } });
    expect(inscripcion.estado).toBe('NO_APROBADA');
    expect(inscripcion.jugador).toMatchObject({ estado: 'DESCARTADO', usuarioId: null });
    expect((await cuentaDe(solicitante)).avisos.map((a) => a.motivo)).toEqual(['no_aprobada']);
  });
});
