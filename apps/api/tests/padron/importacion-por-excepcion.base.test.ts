import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: la importación automática por excepción (decisión 118). Lo seguro se aplica sin
// preguntar, lo dudoso espera a la organización, y la importación entera se puede deshacer. Las
// hojas se arman ya procesadas, sin llamar a la IA. Crea organizaciones propias y las borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la importación por excepción, contra la base', async () => {
  const { prisma } = await import('../../src/lib/prisma');
  const conectada = await prisma.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );
  const it = conectada ? base : base.skip;
  const { aplicarImportacion, confirmarImportacion, deshacerImportacion, descartarImportacion, obtenerImportacion } =
    await import('../../src/modules/padron/importacion/importaciones.service');

  const marca = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  let admin: number;

  type Confianza = 'alta' | 'media' | 'baja' | null;
  const fila = (numero: number, nombre: string, apellido: string, puntos: number, coincideCon: number | null = null, confianza: Confianza = null) => ({
    fila: numero,
    nombre,
    apellido,
    casilleros: [{ etapa: 'Primavera', anio: 2025, puntos }],
    acumulado: null,
    coincideCon,
    confianza,
  });

  // Un circuito con Tercera, el Primavera, el ranking encendido y dos jugadores en el padrón: lo que
  // ya tiene POLENTA cuando vuelve a subir su planilla. Ahí no hay nada que crear en el circuito.
  async function circuito(sufijo: string) {
    const slug = `prueba-excepcion-${sufijo}-${marca}`;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito', slug, usaRanking: true } });
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Tercera', orden: 0 } });
    await prisma.etapa.create({ data: { organizacionId, nombre: 'Primavera', orden: 0 } });
    const ruiz = await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Ana', apellido: 'Ruiz' } });
    const perez = await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Juan', apellido: 'Pérez' } });
    return { slug, organizacionId, categoriaId, ruiz: ruiz.id, perez: perez.id };
  }

  async function importacion(organizacionId: number, categoriaId: number, propuesta: object[]) {
    const { id } = await prisma.importacionPadron.create({ data: { organizacionId, archivoNombre: 'Tercera.xlsx', estado: 'PROCESADO' } });
    const { id: hoja } = await prisma.hojaImportacion.create({
      data: {
        importacionId: id,
        orden: 0,
        archivoNombre: 'Tercera.xlsx',
        hoja: 'Tercera',
        estado: 'PROCESADO',
        resumen: {
          categoriaId,
          categoriaNueva: null,
          etapas: ['Primavera'],
          propuesta,
          textos: {},
          auditoria: { globales: [], porFila: [{ fila: 7, detalle: 'Fila 7: el 99 no está en la planilla' }] },
          conteos: { existentes: 0, nuevos: 0, dudosos: 0, conProblemas: 0 },
          error: null,
          revisar: {},
          aplicadas: [],
        },
      },
    });
    return { id, hoja };
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

  it('aplica solo lo seguro, deja lo dudoso con su motivo y confirma lo que decide la organización', async () => {
    const { slug, organizacionId, categoriaId, ruiz, perez } = await circuito('ok');
    const { id, hoja } = await importacion(organizacionId, categoriaId, [
      fila(4, 'Ana', 'Ruiz', 50, ruiz, 'alta'), // segura: coincide con confianza alta
      fila(5, 'Bruno', 'Sosa', 15), // segura: claramente nuevo
      fila(6, 'J.', 'Perez', 25, perez, 'media'), // dudosa: coincidencia media
      fila(7, 'Ciro', 'Paz', 10), // con un problema de auditoría
      fila(8, 'Pedro', 'PÉREZ', 10), // nuevo, pero ya hay un Pérez en el padrón
    ]);

    const aplicada = await aplicarImportacion(slug, admin, id, {});
    expect(aplicada.estado).toBe('PROCESADO');
    expect(aplicada.aplicadaEn).not.toBeNull();
    expect({ seguras: aplicada.seguras, aRevisar: aplicada.aRevisar }).toEqual({ seguras: 2, aRevisar: 3 });
    expect(aplicada.hojas[0].propuesta.map((f) => [f.fila, f.aplicada, f.revisar])).toEqual([
      [4, true, null],
      [5, true, null],
      [6, false, 'No es seguro que sea el jugador del padrón'],
      [7, false, 'Fila 7: el 99 no está en la planilla'],
      [8, false, 'Ya hay un PÉREZ en el padrón'],
    ]);
    const sosa = await prisma.jugador.findFirstOrThrow({ where: { organizacionId, apellido: 'Sosa' } });
    expect(sosa.importacionId).toBe(id);
    expect(await prisma.movimientoRanking.count({ where: { importacionId: id } })).toBe(2);

    // Lo seguro no se vuelve a aplicar.
    await expect(aplicarImportacion(slug, admin, id, {})).rejects.toMatchObject({ codigo: 'IMPORTACION_NO_PENDIENTE' });
    // Al confirmar se decide solo lo que quedó.
    await expect(
      confirmarImportacion(slug, admin, id, { decisiones: [{ hoja, fila: 6, accion: 'vincular', jugadorId: perez }] }),
    ).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });
    const resultado = await confirmarImportacion(slug, admin, id, {
      decisiones: [
        { hoja, fila: 6, accion: 'vincular', jugadorId: perez },
        { hoja, fila: 7, accion: 'excluir' },
        { hoja, fila: 8, accion: 'crear' },
      ],
    });
    expect(resultado).toMatchObject({ creados: 1, vinculados: 1, excluidos: 1, movimientosCreados: 2 });

    const final = await obtenerImportacion(slug, admin, id);
    expect(final.estado).toBe('CONFIRMADO');
    expect(final.hojas[0].propuesta.every((f) => f.aplicada)).toBe(true);
    expect(await prisma.movimientoRanking.count({ where: { importacionId: id } })).toBe(4);
  });

  it('no vincula desde una fila a revisar al jugador que ya vinculó una fila segura', async () => {
    const { slug, organizacionId, categoriaId, ruiz } = await circuito('doble');
    const { id, hoja } = await importacion(organizacionId, categoriaId, [fila(4, 'Ana', 'Ruiz', 50, ruiz, 'alta'), fila(5, 'A.', 'Ruiz', 10, ruiz, 'baja')]);
    await aplicarImportacion(slug, admin, id, {});

    await expect(
      confirmarImportacion(slug, admin, id, { decisiones: [{ hoja, fila: 5, accion: 'vincular', jugadorId: ruiz }] }),
    ).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });
  });

  it('deshacer borra los movimientos y los jugadores que creó, salvo los que ya tienen otra actividad', async () => {
    const { slug, organizacionId, categoriaId, ruiz } = await circuito('deshacer');
    const { id } = await importacion(organizacionId, categoriaId, [
      fila(4, 'Ana', 'Ruiz', 50, ruiz, 'alta'),
      fila(5, 'Bruno', 'Sosa', 15),
      fila(6, 'Dario', 'Luna', 10),
    ]);
    await aplicarImportacion(slug, admin, id, {});
    // Luna entró a la app después de la importación: ya tiene una cuenta.
    const { id: usuarioId } = await prisma.usuario.create({ data: { email: `luna.${marca}@example.com`, nombre: 'Dario', apellido: 'Luna' } });
    await prisma.jugador.updateMany({ where: { organizacionId, apellido: 'Luna' }, data: { usuarioId } });

    await expect(descartarImportacion(slug, admin, id)).rejects.toMatchObject({ codigo: 'IMPORTACION_APLICADA' });
    expect(await deshacerImportacion(slug, admin, id)).toEqual({ movimientosBorrados: 3, jugadoresBorrados: 1, jugadoresQueQuedan: 1 });

    const apellidos = (await prisma.jugador.findMany({ where: { organizacionId }, orderBy: { apellido: 'asc' } })).map((j) => j.apellido);
    expect(apellidos).toEqual(['Luna', 'Pérez', 'Ruiz']);
    expect(await prisma.movimientoRanking.count({ where: { organizacionId } })).toBe(0);
    const vista = await obtenerImportacion(slug, admin, id);
    expect(vista.estado).toBe('DESCARTADO');
    expect(vista.deshechaEn).not.toBeNull();
    await expect(deshacerImportacion(slug, admin, id)).rejects.toMatchObject({ codigo: 'IMPORTACION_NO_APLICADA' });
  });
});
