import {
  Cuadro,
  EstadoPartido as EstadoPrisma,
  EstadoTorneo,
  FasePartido,
  MotivoMovimiento,
  type Instancia as InstanciaPrisma,
  type Prisma,
} from '@prisma/client';
import type { CampeonDelCuadro, CierreDelTorneo, ClaveCuadro } from '@setpoint/shared';
import { DEL_PADRON_ACTIVOS } from '../../lib/padron';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import type { MovimientoDeRanking } from '../ranking/ranking';
import {
  cuadrosTerminados,
  instanciasDelTorneo,
  ordenarFilas,
  puntosDeLaInstancia,
  rankingConElCierre,
  type TablaDePuntos,
} from './cierre';

// Cierre del torneo (F16, 03-flujo-organizacion.md §12). Al cerrar, cada jugador recibe un
// movimiento de ranking con los puntos de su instancia, en el casillero del torneo del calendario.
// El ranking se sigue calculando en cada consulta: el movimiento nuevo reemplaza al anterior por
// ser el más reciente de su casillero.

const jugador = { select: { id: true, nombre: true, apellido: true } } as const;

const DEL_CIERRE = {
  id: true,
  nombre: true,
  edicion: true,
  estado: true,
  organizacionId: true,
  categoriaId: true,
  categoria: { select: { nombre: true } },
  etapa: { select: { id: true, nombre: true } },
  organizacion: { select: { usaRanking: true, puntajes: { select: { instancia: true, puntos: true } } } },
  // Quien tiene zona entró al sorteo confirmado, aunque después se haya bajado: jugó la fase de grupos.
  inscripciones: { where: { grupo: { not: null } }, select: { jugador } },
  partidos: {
    where: { fase: FasePartido.ELIMINATORIA },
    select: {
      cuadro: true,
      ronda: true,
      jugadorAId: true,
      jugadorBId: true,
      ganadorId: true,
      estado: true,
      jugadorA: jugador,
      jugadorB: jugador,
      sets: { select: { gamesA: true, gamesB: true }, orderBy: { numero: 'asc' } },
    },
  },
} satisfies Prisma.TorneoSelect;

type TorneoDelCierre = Prisma.TorneoGetPayload<{ select: typeof DEL_CIERRE }>;
type Db = Prisma.TransactionClient | typeof prisma;

const CON_RESULTADO = [EstadoPrisma.JUGADA, EstadoPrisma.WALKOVER, EstadoPrisma.ABANDONO];

async function torneoDeLaOrganizacion(db: Db, organizacionId: number, torneoId: number) {
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await db.torneo.findFirst({ where: { id: torneoId, organizacionId }, select: DEL_CIERRE });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  return torneo;
}

// Da puntos si la organización lleva ranking y el torneo es de un torneo del calendario: el
// casillero es ese. Un torneo suelto se cierra sin puntos (decisión 057).
const casilleroDelTorneo = (torneo: TorneoDelCierre) => (torneo.organizacion.usaRanking ? torneo.etapa : null);

const partidosDelCierre = (torneo: TorneoDelCierre) =>
  torneo.partidos.map((p) => ({ ...p, cuadro: p.cuadro!, ronda: p.ronda! }));

function instancias(torneo: TorneoDelCierre) {
  return instanciasDelTorneo(
    torneo.inscripciones.map((i) => i.jugador.id),
    partidosDelCierre(torneo),
  );
}

function tablaDePuntos(torneo: TorneoDelCierre): TablaDePuntos {
  return Object.fromEntries(torneo.organizacion.puntajes.map((p) => [p.instancia.toLowerCase(), p.puntos]));
}

const nombreDelTorneo = (torneo: TorneoDelCierre) => `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`;

// Los movimientos que agrega el cierre, uno por jugador, aunque sume 0: así igual reemplaza lo que
// tenía en el casillero.
function movimientosDelCierre(torneo: TorneoDelCierre, etapaId: number, fecha: Date) {
  const tabla = tablaDePuntos(torneo);
  return [...instancias(torneo)].map(([jugadorId, instancia]) => ({
    organizacionId: torneo.organizacionId,
    jugadorId,
    categoriaId: torneo.categoriaId,
    etapaId,
    torneoId: torneo.id,
    puntos: puntosDeLaInstancia(tabla, instancia),
    instancia: instancia.toUpperCase() as InstanciaPrisma,
    motivo: MotivoMovimiento.RESULTADO_TORNEO,
    detalle: nombreDelTorneo(torneo),
    fecha,
  }));
}

// El campeón de cada cuadro: el ganador de su última ronda. Sin final, no hay campeón.
function campeones(torneo: TorneoDelCierre): CampeonDelCuadro[] {
  return [Cuadro.CAMPEONATO, Cuadro.COMPLEMENTARIA].flatMap((cuadro) => {
    const delCuadro = torneo.partidos.filter((p) => p.cuadro === cuadro);
    const final = delCuadro.find((p) => p.ronda === Math.max(...delCuadro.map((q) => q.ronda!)));
    if (!final?.ganadorId || !final.jugadorA || !final.jugadorB) return [];

    const ganoA = final.ganadorId === final.jugadorA.id;
    const [campeon, rival] = ganoA ? [final.jugadorA, final.jugadorB] : [final.jugadorB, final.jugadorA];
    return [
      {
        cuadro: cuadro.toLowerCase() as ClaveCuadro,
        jugadorId: campeon.id,
        nombre: campeon.nombre,
        apellido: campeon.apellido,
        rival: { nombre: rival.nombre, apellido: rival.apellido },
        estado: final.estado.toLowerCase() as CampeonDelCuadro['estado'],
        sets: final.sets.map((s) => (ganoA ? { propios: s.gamesA, rival: s.gamesB } : { propios: s.gamesB, rival: s.gamesA })),
      },
    ];
  });
}

const aMovimiento = (m: { id: number; jugadorId: number; etapaId: number | null; puntos: number; fecha: Date }): MovimientoDeRanking => m;

// La vista del cierre: lo que va a pasar si todavía no se cerró, o lo que pasó si ya se cerró.
async function vistaDelCierre(torneo: TorneoDelCierre): Promise<CierreDelTorneo> {
  const cerrado = torneo.estado === EstadoTorneo.FINALIZADO;
  const alcanzada = instancias(torneo);
  const partidosJugados = await prisma.partido.count({ where: { torneoId: torneo.id, estado: { in: CON_RESULTADO } } });
  const comun = { torneoId: torneo.id, nombre: nombreDelTorneo(torneo), cerrado, partidosJugados, campeones: campeones(torneo) };
  const etapa = casilleroDelTorneo(torneo);

  if (!etapa) {
    const filas = torneo.inscripciones.map(({ jugador: j }) => ({
      jugadorId: j.id,
      nombre: j.nombre,
      apellido: j.apellido,
      instancia: alcanzada.get(j.id)!,
      ranking: null,
    }));
    return { ...comun, torneoDelCalendario: null, filas: ordenarFilas(filas), resumen: null };
  }

  // Como en el ranking público, cuentan los jugadores que hoy están en la categoría.
  const [deLaCategoria, movimientos] = await Promise.all([
    prisma.jugador.findMany({
      where: { organizacionId: torneo.organizacionId, ...DEL_PADRON_ACTIVOS, categoriaId: torneo.categoriaId },
      select: { id: true, apellido: true },
    }),
    prisma.movimientoRanking.findMany({
      where: { organizacionId: torneo.organizacionId, categoriaId: torneo.categoriaId },
      select: { id: true, jugadorId: true, etapaId: true, puntos: true, fecha: true, torneoId: true },
    }),
  ]);
  const antes = movimientos.filter((m) => m.torneoId !== torneo.id).map(aMovimiento);
  // Cerrado, los puntos son los que se guardaron. Si no, los que se guardarían ahora: con el id más
  // alto posible, para que sean los más recientes de su casillero.
  const delTorneo = cerrado
    ? movimientos.filter((m) => m.torneoId === torneo.id).map(aMovimiento)
    : movimientosDelCierre(torneo, etapa.id, new Date()).map((m) => ({ ...m, id: Number.MAX_SAFE_INTEGER }));

  const ranking = rankingConElCierre(deLaCategoria, antes, delTorneo, etapa.id);
  const puntosDe = new Map(delTorneo.map((m) => [m.jugadorId, m.puntos]));
  const jugadores = new Map(torneo.inscripciones.map(({ jugador: j }) => [j.id, j]));

  const filas = torneo.inscripciones.map(({ jugador: j }) => ({
    jugadorId: j.id,
    nombre: j.nombre,
    apellido: j.apellido,
    instancia: alcanzada.get(j.id)!,
    ranking: { puntos: puntosDe.get(j.id) ?? 0, ...ranking.delJugador(j.id) },
  }));
  // El número uno puede no haber jugado el torneo.
  const numeroUno =
    ranking.numeroUno &&
    (jugadores.get(ranking.numeroUno.jugadorId) ??
      (await prisma.jugador.findUniqueOrThrow({ where: { id: ranking.numeroUno.jugadorId }, select: jugador.select })));

  return {
    ...comun,
    torneoDelCalendario: etapa.nombre,
    filas: ordenarFilas(filas),
    resumen: {
      puntosARepartir: delTorneo.reduce((suma, m) => suma + m.puntos, 0),
      cambianDePuesto: ranking.cambianDePuesto,
      numeroUno: numeroUno && { nombre: numeroUno.nombre, apellido: numeroUno.apellido, esNuevo: ranking.numeroUno!.esNuevo },
    },
  };
}

const CERRABLE = [EstadoTorneo.ELIMINATORIAS, EstadoTorneo.FINALIZADO];

// Lo que va a pasar al cerrar el torneo, o lo que pasó si ya se cerró. Hace falta que los
// cuadros estén terminados: antes no se sabe hasta dónde llegó cada uno.
export async function obtenerCierre(slug: string, usuarioId: number, torneoId: number): Promise<CierreDelTorneo> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(prisma, organizacionId, torneoId);
  if (!CERRABLE.some((e) => e === torneo.estado)) throw new ErrorHttp(409, 'TORNEO_NO_CERRABLE');
  if (!cuadrosTerminados(partidosDelCierre(torneo))) throw new ErrorHttp(409, 'CUADROS_INCOMPLETOS');
  return vistaDelCierre(torneo);
}

// Cierra el torneo y le da a cada jugador los puntos de su instancia. No se deshace: un resultado
// corregido después recalcula los puntos (decisión 055).
export async function cerrarTorneo(slug: string, usuarioId: number, torneoId: number): Promise<CierreDelTorneo> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  await torneoDeLaOrganizacion(prisma, organizacionId, torneoId);

  await prisma.$transaction(async (tx) => {
    // Con el estado como condición, dos cierres simultáneos no dan los puntos dos veces. Además
    // bloquea el torneo: una corrección que llega mientras tanto espera, y después recalcula.
    const { count } = await tx.torneo.updateMany({
      where: { id: torneoId, organizacionId, estado: EstadoTorneo.ELIMINATORIAS },
      data: { estado: EstadoTorneo.FINALIZADO },
    });
    if (count === 0) throw new ErrorHttp(409, 'TORNEO_NO_CERRABLE');

    const torneo = await torneoDeLaOrganizacion(tx, organizacionId, torneoId);
    if (!cuadrosTerminados(partidosDelCierre(torneo))) throw new ErrorHttp(409, 'CUADROS_INCOMPLETOS');

    const etapa = casilleroDelTorneo(torneo);
    if (etapa) await tx.movimientoRanking.createMany({ data: movimientosDelCierre(torneo, etapa.id, new Date()) });
  });

  return obtenerCierre(slug, usuarioId, torneoId);
}

// Después de corregir un resultado de un torneo cerrado, actualiza los puntos de quien cambió de
// instancia (decisión 055). Los movimientos se actualizan en su lugar y conservan la fecha del
// cierre: si se crearan de nuevo, le ganarían el casillero a un torneo del mismo calendario que se
// cerró después. La llama la carga de resultados, en su transacción.
export async function recalcularPuntos(tx: Prisma.TransactionClient, organizacionId: number, torneoId: number) {
  // Primero solo el estado: la carga la llama en cada resultado, y casi siempre el torneo está abierto.
  const { estado } = await tx.torneo.findUniqueOrThrow({ where: { id: torneoId }, select: { estado: true } });
  if (estado !== EstadoTorneo.FINALIZADO) return;

  const torneo = await torneoDeLaOrganizacion(tx, organizacionId, torneoId);
  const tabla = tablaDePuntos(torneo);
  const guardados = await tx.movimientoRanking.findMany({
    where: { torneoId, motivo: MotivoMovimiento.RESULTADO_TORNEO },
    select: { id: true, jugadorId: true, instancia: true },
  });
  for (const [jugadorId, instancia] of instancias(torneo)) {
    const guardado = guardados.find((m) => m.jugadorId === jugadorId);
    if (!guardado || guardado.instancia === instancia.toUpperCase()) continue;
    await tx.movimientoRanking.update({
      where: { id: guardado.id },
      data: { instancia: instancia.toUpperCase() as InstanciaPrisma, puntos: puntosDeLaInstancia(tabla, instancia) },
    });
  }
}
