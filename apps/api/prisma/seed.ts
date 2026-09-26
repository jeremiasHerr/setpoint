// ============================================================================
// Seed de desarrollo — SetPoint
//
// Llena la base local con datos de prueba para poder desarrollar sin depender
// de otras features. NO es la carga de datos del producto: en producción,
// la organización carga su padrón desde la web (F02 y F03).
//
// Los puntos son los del ranking real de Tercera 2026 de POLENTA.
// Los nombres son inventados, para no guardar datos de personas reales en Git.
//
// Uso:
//   npm run db:seed -w apps/api          -> carga los datos
//   npx prisma migrate reset             -> borra todo, migra y corre este seed
// ============================================================================

import {
  PrismaClient,
  Instancia,
  MotivoMovimiento,
  EstadoTorneo,
  ModoInscripcion,
} from '@prisma/client';

const prisma = new PrismaClient();

const DIA = 24 * 60 * 60 * 1000;
const diasAtras = (n: number) => new Date(Date.now() - n * DIA);
const diasAdelante = (n: number) => new Date(Date.now() + n * DIA);

// Etapas del calendario, en orden. Cada una es un casillero del ranking.
const ETAPAS = ['Primavera', 'Verano', 'Pretemporada', 'Otoño', 'Invierno'];

// Fechas de cada casillero, relativas a hoy.
// Son relativas a propósito: si fueran fijas, dentro de unos meses la
// primera etapa quedaría fuera de la ventana de 12 meses y los totales
// dejarían de coincidir con el ranking de referencia.
const DIAS_ATRAS_POR_ETAPA = [300, 220, 180, 110, 25];

// Tabla de puntos del reglamento de POLENTA.
const PUNTAJES: [Instancia, number][] = [
  [Instancia.CAMPEON, 100],
  [Instancia.FINALISTA, 75],
  [Instancia.SEMIFINALISTA, 50],
  [Instancia.CUARTOS, 25],
  [Instancia.OCTAVOS, 15],
  [Instancia.PARTICIPACION, 10],
];

// Ranking de Tercera 2026. Casilleros en el orden de ETAPAS:
//   Primavera 25 · Verano 25/26 · Pretemporada 26 · Otoño 26 · Invierno 26
// El comentario de cada fila es el acumulado que tiene que dar.
const TERCERA: [string, string, number[]][] = [
  ['Martín', 'Sanhueza', [10, 15, 50, 15, 75]], // 165
  ['Diego', 'Antileo', [15, 10, 10, 50, 25]], // 110
  ['Juan', 'Painemil', [0, 0, 100, 0, 0]], // 100
  ['Javier', 'Roa', [10, 10, 0, 25, 50]], //  95
  ['Marcelo', 'Ledesma', [0, 10, 50, 10, 15]], //  85
  ['Walter', 'Bustos', [10, 15, 0, 10, 50]], //  85
  ['Carlos', 'Huenchul', [10, 0, 25, 15, 25]], //  75
  ['Claudio', 'Nahuel', [10, 10, 10, 25, 15]], //  70
  ['Gianluca', 'Ferraro', [10, 0, 25, 10, 25]], //  70
  ['Damián', 'Curruhuinca', [0, 10, 25, 15, 10]], //  60
  ['Fernando', 'Llancafilo', [15, 10, 10, 15, 10]], //  60
  ['Cristian', 'Sepúlveda', [0, 0, 0, 50, 10]], //  60
  ['Gerardo', 'Quilodrán', [10, 10, 10, 10, 15]], //  55
  ['Daniel', 'Zapata', [0, 0, 25, 15, 15]], //  55
  ['Sergio', 'Mansilla', [10, 10, 10, 10, 10]], //  50
  ['Jorge', 'Pincheira', [10, 10, 0, 15, 15]], //  50
  ['Julián', 'Toledo', [0, 0, 0, 25, 10]], //  35
  ['Jesús', 'Riquelme', [0, 0, 10, 15, 10]], //  35
  ['Darío', 'Parada', [0, 0, 0, 10, 25]], //  35
  ['Adrián', 'Montecino', [10, 0, 10, 10, 0]], //  30
  ['Ricardo', 'Barrera', [0, 10, 0, 10, 10]], //  30
  ['Oscar', 'Villalobos', [0, 0, 0, 25, 0]], //  25
  ['Alejo', 'Figueroa', [0, 0, 0, 0, 15]], //  15
  ['Gustavo', 'Fuentealba', [0, 0, 0, 0, 15]], //  15
  ['Pablo', 'Medel', [0, 0, 10, 0, 0]], //  10
  ['Rodrigo', 'Maturana', [0, 0, 0, 0, 0]], //   0
];

// Borra todo, de las tablas hijas a las padres, para que el seed se pueda
// correr varias veces sin chocar con las restricciones UNIQUE.
async function limpiar() {
  await prisma.$transaction([
    prisma.movimientoRanking.deleteMany(),
    prisma.extraccionResultado.deleteMany(),
    prisma.setPartido.deleteMany(),
    prisma.partido.deleteMany(),
    prisma.pago.deleteMany(),
    prisma.inscripcion.deleteMany(),
    prisma.liquidacion.deleteMany(),
    prisma.torneo.deleteMany(),
    prisma.jugador.deleteMany(),
    prisma.puntajeInstancia.deleteMany(),
    prisma.etapa.deleteMany(),
    prisma.categoria.deleteMany(),
    prisma.cancha.deleteMany(),
    prisma.club.deleteMany(),
    prisma.importacionPadron.deleteMany(),
    prisma.cuentaCobro.deleteMany(),
    prisma.adminOrganizacion.deleteMany(),
    prisma.organizacion.deleteMany(),
    prisma.usuario.deleteMany(),
  ]);
}

async function main() {
  await limpiar();

  // --- organización, categorías, etapas y puntajes en una sola operación ---
  const org = await prisma.organizacion.create({
    data: {
      nombre: 'Polenta Team Tenis',
      slug: 'polenta',
      descripcion: 'Circuito amateur de tenis de Neuquén',
      usaRanking: true,
      ventanaRankingMeses: 12,
      categorias: {
        create: [
          { nombre: 'Segunda', orden: 1 },
          { nombre: 'Tercera', orden: 2 },
        ],
      },
      etapas: {
        create: ETAPAS.map((nombre, i) => ({ nombre, orden: i + 1 })),
      },
      puntajes: {
        create: PUNTAJES.map(([instancia, puntos]) => ({ instancia, puntos })),
      },
    },
    include: { categorias: true, etapas: true },
  });

  const tercera = org.categorias.find((c) => c.nombre === 'Tercera')!;
  const etapas = [...org.etapas].sort((a, b) => a.orden - b.orden);

  // --- jugadores de Tercera con sus movimientos de ranking ---
  // Los casilleros en 0 no generan movimiento: un jugador sin movimiento en
  // una etapa simplemente no sumó ahí. El ranking lo trata igual que un 0.
  for (const [nombre, apellido, casilleros] of TERCERA) {
    await prisma.jugador.create({
      data: {
        organizacionId: org.id,
        categoriaId: tercera.id,
        nombre,
        apellido,
        movimientos: {
          create: casilleros
            .map((puntos, i) => ({ puntos, i }))
            .filter(({ puntos }) => puntos > 0)
            .map(({ puntos, i }) => ({
              organizacionId: org.id,
              categoriaId: tercera.id,
              etapaId: etapas[i].id,
              puntos,
              motivo: MotivoMovimiento.IMPORTACION_INICIAL,
              detalle: 'Ranking de referencia Tercera 2026',
              fecha: diasAtras(DIAS_ATRAS_POR_ETAPA[i]),
            })),
        },
      },
    });
  }

  // --- un torneo publicado, con las inscripciones abiertas ---
  await prisma.torneo.create({
    data: {
      organizacionId: org.id,
      categoriaId: tercera.id,
      etapaId: etapas[0].id, // Primavera
      nombre: 'Primavera 26 · Tercera',
      edicion: 'Primavera 2026',
      estado: EstadoTorneo.PUBLICADO,
      cupo: 32,
      precio: 45000,
      modoInscripcion: ModoInscripcion.CERRADA,
      cierreInscripcion: diasAdelante(14),
      fechaInicio: diasAdelante(21),
    },
  });

  // --- verificación ---
  // Suma simple: vale porque en el seed hay un solo movimiento por etapa.
  // El ranking real toma, por cada etapa, el movimiento más reciente.
  const jugadores = await prisma.jugador.findMany({
    where: { organizacionId: org.id, categoriaId: tercera.id },
    include: { movimientos: true },
  });

  const tabla = jugadores
    .map((j) => ({
      jugador: `${j.nombre} ${j.apellido}`,
      puntos: j.movimientos.reduce((suma, m) => suma + m.puntos, 0),
    }))
    .sort((a, b) => b.puntos - a.puntos);

  console.log(`\nOrganización: ${org.nombre}`);
  console.log(`Categorías: ${org.categorias.length} · Etapas: ${etapas.length}`);
  console.log(`Jugadores de Tercera: ${tabla.length}\n`);
  console.table(tabla.slice(0, 5));

  const primero = tabla[0].puntos;
  const ultimo = tabla[tabla.length - 1].puntos;
  if (primero !== 165 || ultimo !== 0) {
    throw new Error(
      `El ranking no coincide con la referencia: primero ${primero} (esperado 165), último ${ultimo} (esperado 0)`,
    );
  }
  console.log('Ranking verificado: el primero suma 165 y el último 0.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());