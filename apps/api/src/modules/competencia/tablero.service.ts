import { Cuadro, EstadoPartido as EstadoPrisma, EstadoResultadoPropuesto, EstadoTorneo, FasePartido, type Prisma } from '@prisma/client';
import { nombreCuadroConsuelo, type BloqueDelTablero, type ClaveCuadro, type EstadoPartido, type PartidoDelTablero, type Tablero } from '@setpoint/shared';
import { hoy } from '../../lib/fechas';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { cuadrosTerminados } from './cierre';
import { partidosSinResultado } from './cuadros';
import { zonasConPosiciones } from './posiciones';
import { INCLUIR_ZONAS, inscriptosYPartidos } from './posiciones.service';
import { marcador } from '../jugador/mis-partidos';
import { datosDeLaPropuesta, ganadorDeLaPropuesta, propuestaVigente } from '../resultado-del-jugador/resultado-del-jugador';
import { diasHasta, plazoQueCorre, porFechaAcordada, porUrgencia, situacionDelPartido } from './tablero';

// Tablero del torneo (F15): la pantalla de la organización mientras se juega. Todo se calcula
// en cada consulta, como las posiciones: no se guarda ninguna situación (decisión 060).

const jugador = { select: { id: true, nombre: true, apellido: true, telefono: true } } as const;

const DEL_PARTIDO = {
  id: true,
  fase: true,
  grupo: true,
  cuadro: true,
  ronda: true,
  ordenEnRonda: true,
  jugadorAId: true,
  jugadorBId: true,
  ganadorId: true,
  estado: true,
  fechaLimite: true,
  fechaAcordada: true,
  jugadorA: jugador,
  jugadorB: jugador,
  sets: { select: { gamesA: true, gamesB: true, esSuperTieBreak: true }, orderBy: { numero: 'asc' } },
  resultadosPropuestos: {
    where: { estado: { in: [EstadoResultadoPropuesto.PENDIENTE, EstadoResultadoPropuesto.RECHAZADO] } },
    select: { id: true, jugadorId: true, estado: true, datos: true },
  },
} satisfies Prisma.PartidoSelect;

type PartidoLeido = Prisma.PartidoGetPayload<{ select: typeof DEL_PARTIDO }>;

// Con el sorteo sin confirmar no hay partidos; un torneo cancelado no se sigue.
const CON_TABLERO = [EstadoTorneo.ZONAS_GENERADAS, EstadoTorneo.GRUPOS_EN_CURSO, EstadoTorneo.ELIMINATORIAS, EstadoTorneo.FINALIZADO];

const aJugador = (j: PartidoLeido['jugadorA']) =>
  j && { jugadorId: j.id, nombre: j.nombre, apellido: j.apellido, telefono: j.telefono };

// El que cargó un jugador y todavía no cuenta, desde el lado de A (decisión 127). Con resultado, nada.
function propuestaDelPartido(p: PartidoLeido): PartidoDelTablero['resultadoPropuesto'] {
  if (p.ganadorId !== null || p.jugadorAId === null || p.jugadorBId === null) return null;
  const propuesta = propuestaVigente(p.resultadosPropuestos.map((r) => ({ ...r, estado: r.estado as 'PENDIENTE' | 'RECHAZADO' })));
  if (!propuesta) return null;
  const datos = datosDeLaPropuesta(propuesta);
  const estado = datos.tipo === 'jugado' ? ('JUGADA' as const) : ('ABANDONO' as const);
  return {
    cargadoPor: propuesta.jugadorId === p.jugadorAId ? 'a' : 'b',
    estado: propuesta.estado === 'PENDIENTE' ? 'pendiente' : 'rechazado',
    ganador: ganadorDeLaPropuesta(datos, p.jugadorAId, p.jugadorBId) === p.jugadorAId ? 'a' : 'b',
    marcador: marcador({ estado, sets: datos.tipo === 'jugado' ? datos.sets : [] }, true),
  };
}

function aPartido(p: PartidoLeido, dia: string, ahora: Date): PartidoDelTablero {
  return {
    id: p.id,
    grupo: p.grupo,
    cuadro: (p.cuadro?.toLowerCase() ?? null) as ClaveCuadro | null,
    ronda: p.ronda,
    jugadorA: aJugador(p.jugadorA),
    jugadorB: aJugador(p.jugadorB),
    estado: p.estado.toLowerCase() as EstadoPartido,
    situacion: situacionDelPartido(p, dia, ahora),
    ganadorId: p.ganadorId,
    fechaLimite: p.fechaLimite?.toISOString().slice(0, 10) ?? null,
    dias: p.fechaLimite ? diasHasta(p.fechaLimite, dia) : null,
    fechaAcordada: p.fechaAcordada?.toISOString() ?? null,
    sets: p.sets,
    resultadoPropuesto: propuestaDelPartido(p),
  };
}

// Las barras: una por zona en la fase de grupos, una por ronda de cada cuadro después.
function bloques(partidos: PartidoDelTablero[]): BloqueDelTablero[] {
  const porClave = new Map<string, BloqueDelTablero>();
  for (const partido of partidos) {
    const clave = partido.grupo ?? `${partido.cuadro}-${partido.ronda}`;
    const bloque = porClave.get(clave) ?? { clave, grupo: partido.grupo, cuadro: partido.cuadro, ronda: partido.ronda, partidos: [] };
    bloque.partidos.push(partido);
    porClave.set(clave, bloque);
  }
  return [...porClave.values()];
}

export async function obtenerTablero(slug: string, usuarioId: number, torneoId: number): Promise<Tablero> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!Number.isInteger(torneoId)) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');

  // El filtro por organización es el aislamiento: el id solo no alcanza.
  const torneo = await prisma.torneo.findFirst({
    where: { id: torneoId, organizacionId },
    include: { categoria: { select: { nombre: true } }, organizacion: { select: { nombreCuadroConsuelo: true, usaRanking: true } }, ...INCLUIR_ZONAS },
  });
  if (!torneo) throw new ErrorHttp(404, 'TORNEO_NO_ENCONTRADO');
  if (!CON_TABLERO.some((e) => e === torneo.estado)) throw new ErrorHttp(409, 'TABLERO_NO_DISPONIBLE');

  const fase = torneo.estado === EstadoTorneo.FINALIZADO ? 'terminado' : torneo.gruposCerrados ? 'cuadros' : 'grupos';
  // Los enums se ordenan como están declarados: Campeonato antes que el cuadro consuelo.
  const leidos = await prisma.partido.findMany({
    where: {
      torneoId: torneo.id,
      fase: fase === 'grupos' ? FasePartido.GRUPOS : FasePartido.ELIMINATORIA,
      estado: { not: EstadoPrisma.CANCELADA },
    },
    orderBy: [{ grupo: 'asc' }, { cuadro: 'asc' }, { ronda: 'asc' }, { ordenEnRonda: 'asc' }, { id: 'asc' }],
    select: DEL_PARTIDO,
  });

  const dia = hoy();
  const ahora = new Date();
  const partidos = leidos.map((p) => aPartido(p, dia, ahora));
  const cuenta = (situacion: PartidoDelTablero['situacion']) => partidos.filter((p) => p.situacion === situacion).length;

  // La tabla de cada zona sale de la misma cuenta que las posiciones y el cierre de las zonas.
  const { inscriptos, partidos: partidosDeZona } = inscriptosYPartidos(torneo);
  const zonas =
    fase === 'grupos'
      ? zonasConPosiciones(inscriptos, partidosDeZona, torneo).map((zona) => ({
          ...zona,
          partidos: partidos.filter((p) => p.grupo === zona.grupo),
        }))
      : [];

  const rondas: Tablero['rondas'] = {};
  for (const cuadro of [Cuadro.CAMPEONATO, Cuadro.COMPLEMENTARIA]) {
    const delCuadro = leidos.filter((p) => p.cuadro === cuadro);
    if (delCuadro.length > 0) rondas[cuadro.toLowerCase() as ClaveCuadro] = Math.max(...delCuadro.map((p) => p.ronda!));
  }

  const zonasAbiertas = torneo.estado === EstadoTorneo.ZONAS_GENERADAS || torneo.estado === EstadoTorneo.GRUPOS_EN_CURSO;
  return {
    torneoId: torneo.id,
    nombre: `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`,
    nombreCuadroConsuelo: nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo),
    usaRanking: torneo.organizacion.usaRanking,
    fase,
    clasificanPorGrupo: torneo.clasificanPorGrupo,
    tieneComplementaria: torneo.tieneComplementaria,
    rondas,
    plazo: plazoQueCorre(leidos, dia, ahora),
    totales: {
      partidos: partidos.length,
      jugados: cuenta('jugado'),
      conFecha: cuenta('con_fecha'),
      faltaCargar: cuenta('falta_cargar'),
      sinCoordinar: cuenta('sin_coordinar'),
      vencidos: cuenta('vencido'),
    },
    bloques: bloques(partidos),
    vencidos: porUrgencia(partidos.filter((p) => p.situacion === 'vencido')),
    faltaCargar: porFechaAcordada(partidos.filter((p) => p.situacion === 'falta_cargar')),
    sinCoordinar: porUrgencia(partidos.filter((p) => p.situacion === 'sin_coordinar')),
    zonas,
    sePuedenCerrarLasZonas: zonasAbiertas && !torneo.gruposCerrados && partidosSinResultado(partidosDeZona) === 0,
    sePuedeCerrarElTorneo:
      torneo.estado === EstadoTorneo.ELIMINATORIAS &&
      cuadrosTerminados(leidos.map((p) => ({ ...p, cuadro: p.cuadro!, ronda: p.ronda! }))),
  };
}
