import { afterAll, beforeAll, describe, expect, it as base } from 'vitest';

// Contra Postgres: un lote de varias hojas se confirma entero (decisión 012). Las hojas se arman ya
// procesadas, sin llamar a la IA. Crea organizaciones propias y las borra al terminar.

try {
  process.loadEnvFile('.env');
} catch {
  // Sin .env: vale lo que haya en el entorno.
}

describe.skipIf(!process.env.DATABASE_URL)('la importación de varias hojas, contra la base', async () => {
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

  const jugador = (fila: number, nombre: string, apellido: string, puntos: number, coincideCon: number | null = null) => ({
    fila,
    nombre,
    apellido,
    casilleros: [{ etapa: 'Primavera', anio: 2025, puntos }],
    acumulado: null,
    coincideCon,
    confianza: coincideCon === null ? null : 'alta',
  });

  const resumen = (categoriaNueva: string, propuesta: object[]) => ({
    categoriaId: null,
    categoriaNueva,
    etapas: ['Primavera'],
    propuesta,
    textos: {},
    auditoria: { globales: [], porFila: [] },
    conteos: { existentes: 0, nuevos: propuesta.length, dudosos: 0, conProblemas: 0 },
    error: null,
  });

  // Segunda y Tercera leídas, y un archivo que no se pudo abrir.
  async function lote(sufijo: string, propuestas: { segunda: object[]; tercera: object[] }) {
    const slug = `prueba-lote-${sufijo}-${marca}`;
    const { id: organizacionId } = await prisma.organizacion.create({ data: { nombre: 'Circuito', slug, usaRanking: false } });
    await prisma.adminOrganizacion.create({ data: { organizacionId, usuarioId: admin } });
    const { id } = await prisma.importacionPadron.create({ data: { organizacionId, archivoNombre: '3 archivos', estado: 'PROCESADO' } });
    await prisma.hojaImportacion.createMany({
      data: [
        { importacionId: id, orden: 0, archivoNombre: 'Ranking 2025.xlsx', hoja: 'Segunda', estado: 'PROCESADO', resumen: resumen('Segunda', propuestas.segunda) },
        { importacionId: id, orden: 1, archivoNombre: 'Ranking 2025.xlsx', hoja: 'Tercera', estado: 'PROCESADO', resumen: resumen('Tercera', propuestas.tercera) },
        { importacionId: id, orden: 2, archivoNombre: 'roto.xlsx', hoja: '', estado: 'ERROR', resumen: { categoriaId: null, error: 'No pudimos abrir el archivo' } },
      ],
    });
    const hojas = await prisma.hojaImportacion.findMany({ where: { importacionId: id }, orderBy: { orden: 'asc' } });
    return { slug, organizacionId, id, hojas: hojas.map((h) => h.id) };
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

  it('muestra cada hoja y lo que se crea, y confirma el lote entero dejando afuera la que no se pudo leer', async () => {
    const { slug, organizacionId, id, hojas } = await lote('ok', {
      segunda: [jugador(4, 'Ana', 'Ruiz', 50)],
      tercera: [jugador(4, 'Bruno', 'Sosa', 15), jugador(5, 'Ciro', 'Paz', 10)],
    });

    const vista = await obtenerImportacion(slug, admin, id);
    expect(vista.hojas.map((h) => `${h.categoria ?? h.archivoNombre} ${h.estado}`)).toEqual([
      'Segunda PROCESADO',
      'Tercera PROCESADO',
      'roto.xlsx ERROR',
    ]);
    expect(vista.conteos.nuevos).toBe(3);
    expect(vista.crea).toEqual({ categorias: ['Segunda', 'Tercera'], etapas: ['Primavera'], ranking: true });

    const resultado = await confirmarImportacion(slug, admin, id, {
      decisiones: [
        { hoja: hojas[0], fila: 4, accion: 'crear' },
        { hoja: hojas[1], fila: 4, accion: 'crear' },
        { hoja: hojas[1], fila: 5, accion: 'crear' },
      ],
    });
    expect(resultado).toMatchObject({ creados: 3, movimientosCreados: 3 });

    const jugadores = await prisma.jugador.findMany({ where: { organizacionId }, include: { categoria: true }, orderBy: { apellido: 'asc' } });
    expect(jugadores.map((j) => `${j.apellido} ${j.categoria!.nombre}`)).toEqual(['Paz Tercera', 'Ruiz Segunda', 'Sosa Tercera']);
    expect(await prisma.etapa.count({ where: { organizacionId } })).toBe(1);
    const estados = await prisma.hojaImportacion.findMany({ where: { importacionId: id }, orderBy: { orden: 'asc' }, select: { estado: true } });
    expect(estados.map((h) => h.estado)).toEqual(['CONFIRMADO', 'CONFIRMADO', 'ERROR']);
  });

  it('no deja vincular al mismo jugador del padrón desde dos hojas: va en una sola categoría', async () => {
    const { slug, organizacionId, id, hojas } = await lote('doble', { segunda: [], tercera: [] });
    const { id: categoriaId } = await prisma.categoria.create({ data: { organizacionId, nombre: 'Cuarta', orden: 0 } });
    const { id: jugadorId } = await prisma.jugador.create({ data: { organizacionId, categoriaId, nombre: 'Ana', apellido: 'Ruiz' } });
    await prisma.hojaImportacion.update({ where: { id: hojas[0] }, data: { resumen: resumen('Segunda', [jugador(4, 'Ana', 'Ruiz', 50, jugadorId)]) } });
    await prisma.hojaImportacion.update({ where: { id: hojas[1] }, data: { resumen: resumen('Tercera', [jugador(4, 'Ana', 'Ruiz', 10, jugadorId)]) } });

    await expect(
      confirmarImportacion(slug, admin, id, {
        decisiones: [
          { hoja: hojas[0], fila: 4, accion: 'vincular', jugadorId },
          { hoja: hojas[1], fila: 4, accion: 'vincular', jugadorId },
        ],
      }),
    ).rejects.toMatchObject({ codigo: 'DATOS_INVALIDOS' });
  });
});
