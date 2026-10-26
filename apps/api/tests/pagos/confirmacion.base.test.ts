import { afterAll, beforeAll, describe, expect, it as base, vi } from 'vitest';

// Contra Postgres: la idempotencia del webhook depende del bloqueo de la fila, así que se prueba con
// la base. Usa la del docker compose (`docker compose up -d db`) y se saltea si no hay DATABASE_URL o
// la base no responde. Crea una organización propia y la borra al terminar.

vi.mock('../../src/lib/correo', () => ({ enviarCorreo: vi.fn(async () => {}) }));

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('confirmación del pago, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { confirmarPago } = await import('../../src/modules/pagos/pagos.service');
  const { enviarCorreo } = await import('../../src/lib/correo');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const slug = `prueba-pago-${marca}`;
  let inscripcionId: number;

  beforeAll(async () => {
    if (!conectada) return;
    const organizacion = await prisma.organizacion.create({ data: { nombre: 'Circuito de prueba', slug } });
    const categoria = await prisma.categoria.create({ data: { organizacionId: organizacion.id, nombre: 'Tercera', orden: 1 } });
    const torneo = await prisma.torneo.create({
      data: { organizacionId: organizacion.id, categoriaId: categoria.id, nombre: 'Abierto de prueba', cupo: 8, estado: 'PUBLICADO', precio: 30000 },
    });
    const usuario = await prisma.usuario.create({ data: { email: `pagador.${marca}@example.com`, nombre: 'Ana', apellido: 'Gómez' } });
    const jugador = await prisma.jugador.create({
      data: { organizacionId: organizacion.id, categoriaId: categoria.id, nombre: 'Ana', apellido: 'Gómez', usuarioId: usuario.id },
    });
    inscripcionId = (
      await prisma.inscripcion.create({
        data: { torneoId: torneo.id, jugadorId: jugador.id, usuarioId: usuario.id, reservaVence: new Date(Date.now() + 15 * 60_000) },
      })
    ).id;
  });

  afterAll(async () => {
    if (!conectada) return;
    await prisma.inscripcion.deleteMany({ where: { torneo: { organizacion: { slug } } } });
    await prisma.organizacion.deleteMany({ where: { slug } });
    await prisma.usuario.deleteMany({ where: { email: { endsWith: `.${marca}@example.com` } } });
  });

  it('dos avisos del mismo pago a la vez mandan un solo comprobante', async () => {
    const pago = { medio: 'MERCADOPAGO' as const, monto: 30000, mpPaymentId: `prueba-${marca}` };
    await Promise.all([confirmarPago(inscripcionId, pago), confirmarPago(inscripcionId, pago)]);
    // Un aviso que llega después, cuando ya estaba pagada, tampoco manda otro.
    await confirmarPago(inscripcionId, pago);

    expect(enviarCorreo).toHaveBeenCalledTimes(1);
    expect(await prisma.pago.count({ where: { inscripcionId } })).toBe(1);
    expect((await prisma.inscripcion.findUniqueOrThrow({ where: { id: inscripcionId } })).estado).toBe('PAGADA');
  });
});
