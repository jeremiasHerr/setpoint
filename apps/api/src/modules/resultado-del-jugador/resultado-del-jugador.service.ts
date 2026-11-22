import { EstadoResultadoPropuesto, EstadoTorneo, QuienCargaResultados, type Prisma } from '@prisma/client';
import {
  resultadoDelTorneoSchema,
  type CargaDelResultado,
  type DatosResultadoDelJugador,
  type RespuestaMisPartidos,
} from '@setpoint/shared';
import { organizacionAdministrada, perfilDeJugador } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { camposConError } from '../../middleware/validar';
import { avisoDeResultadoCargado, avisoDeResultadoConfirmado, avisoDeResultadoRechazado, type Aviso } from '../avisos/avisos';
import { enviarAvisos } from '../avisos/avisos.service';
import { aplicarResultado, sistemaDeJuego, torneoDeLaOrganizacion } from '../competencia/resultados.service';
import { marcador } from '../jugador/mis-partidos';
import { misPartidos } from '../jugador/mis-partidos.service';
import { datosDeLaPropuesta, problemaAlCargar, problemaAlResponder } from './resultado-del-jugador';

// El resultado que carga un jugador desde la app y confirma el rival (decisión 127). Mientras no se
// confirma, el partido no tiene resultado: las tablas y los cuadros no se mueven. Lo que cuenta lo
// guarda aplicarResultado, el mismo camino que usa la organización.

const EN_JUEGO: EstadoTorneo[] = [EstadoTorneo.ZONAS_GENERADAS, EstadoTorneo.GRUPOS_EN_CURSO, EstadoTorneo.ELIMINATORIAS];
const JUGADOR = { select: { nombre: true, usuarioId: true } } as const;

const DEL_PARTIDO = {
  id: true,
  torneoId: true,
  jugadorAId: true,
  jugadorBId: true,
  estado: true,
  jugadorA: JUGADOR,
  jugadorB: JUGADOR,
  torneo: { select: { estado: true, organizacion: { select: { quienCargaResultados: true } } } },
  resultadosPropuestos: {
    where: { estado: { in: [EstadoResultadoPropuesto.PENDIENTE, EstadoResultadoPropuesto.RECHAZADO] } },
    select: { id: true, jugadorId: true, estado: true, datos: true, cargadoPorId: true },
  },
} satisfies Prisma.PartidoSelect;

type Partido = Prisma.PartidoGetPayload<{ select: typeof DEL_PARTIDO }>;

// El partido tiene que ser suyo y de esta organización: el id solo no alcanza.
async function partidoDelJugador(slug: string, usuarioId: number, partidoId: number) {
  const { organizacionId, jugadorId } = await perfilDeJugador(slug, usuarioId);
  if (!Number.isInteger(partidoId)) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const partido = await prisma.partido.findFirst({
    where: { id: partidoId, torneo: { organizacionId }, OR: [{ jugadorAId: jugadorId }, { jugadorBId: jugadorId }] },
    select: DEL_PARTIDO,
  });
  if (!partido) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  if (!EN_JUEGO.includes(partido.torneo.estado)) throw new ErrorHttp(409, 'TORNEO_NO_EN_JUEGO');
  return { organizacionId, jugadorId, partido };
}

// Yo y el rival, cada uno con su nombre y su cuenta, para los avisos.
function lados(partido: Partido, jugadorId: number) {
  const esA = partido.jugadorAId === jugadorId;
  return { esA, yo: esA ? partido.jugadorA! : partido.jugadorB!, rival: esA ? partido.jugadorB! : partido.jugadorA! };
}

// Sin esperarlo: un aviso que no sale no deshace lo que se guardó (decisión 047).
function avisar(avisos: Aviso[]) {
  void enviarAvisos(avisos).catch((error) => console.error('No se pudo avisar el resultado', error));
}

// El marcador como lo ve cada lado: "6-3 6-4" o "ab.".
function marcadorDesde(datos: DatosResultadoDelJugador, esA: boolean) {
  const estado = datos.tipo === 'jugado' ? ('JUGADA' as const) : ('ABANDONO' as const);
  return marcador({ estado, sets: datos.tipo === 'jugado' ? datos.sets : [] }, esA);
}

const propuestasLeidas = (partido: Partido) =>
  partido.resultadosPropuestos.map((p) => ({ ...p, estado: p.estado as 'PENDIENTE' | 'RECHAZADO' }));

// Lo que necesita la pantalla Cargar el resultado: el partido como lo ve en Cuándo juego, quién es
// él y el sistema de juego del torneo, para validar los sets antes de mandarlos.
export async function cargaDelResultado(slug: string, usuarioId: number, partidoId: number): Promise<CargaDelResultado> {
  const { organizacionId, jugadorId, partido } = await partidoDelJugador(slug, usuarioId, partidoId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, partido.torneoId);
  const enCuandoJuego = (await misPartidos(slug, usuarioId)).partidos?.partidos.find((p) => p.id === partido.id);
  if (!enCuandoJuego) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const yo = await prisma.jugador.findUniqueOrThrow({ where: { id: jugadorId }, select: { id: true, nombre: true, apellido: true } });
  return {
    partido: enCuandoJuego,
    yo: { jugadorId: yo.id, nombre: yo.nombre, apellido: yo.apellido },
    esA: partido.jugadorAId === jugadorId,
    sistema: sistemaDeJuego(torneo),
  };
}

// Un jugador carga el resultado de su partido. Queda pendiente hasta que el rival lo confirme; si
// ya había cargado otro que seguía pendiente, este lo reemplaza.
export async function cargarResultadoDelJugador(
  slug: string,
  usuarioId: number,
  partidoId: number,
  datos: DatosResultadoDelJugador,
): Promise<RespuestaMisPartidos> {
  const { organizacionId, jugadorId, partido } = await partidoDelJugador(slug, usuarioId, partidoId);
  const cargan = partido.torneo.organizacion.quienCargaResultados === QuienCargaResultados.ORGANIZACION_Y_JUGADORES;
  const problema = problemaAlCargar(partido, jugadorId, cargan, propuestasLeidas(partido));
  if (problema === 'LA_ORGANIZACION_CARGA_LOS_RESULTADOS') throw new ErrorHttp(403, problema);
  if (problema) throw new ErrorHttp(409, problema);

  // Con las reglas del torneo, igual que cuando carga la organización.
  const torneo = await torneoDeLaOrganizacion(organizacionId, partido.torneoId);
  const validado = resultadoDelTorneoSchema(sistemaDeJuego(torneo)).safeParse(datos);
  if (!validado.success) throw new ErrorHttp(400, 'DATOS_INVALIDOS', camposConError(validado.error));
  if (datos.tipo === 'abandono' && datos.ganadorId !== partido.jugadorAId && datos.ganadorId !== partido.jugadorBId) {
    throw new ErrorHttp(400, 'DATOS_INVALIDOS', { ganadorId: 'Tiene que ser uno de los dos jugadores del partido' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.resultadoPropuesto.updateMany({
      where: { partidoId: partido.id, jugadorId, estado: EstadoResultadoPropuesto.PENDIENTE },
      data: { estado: EstadoResultadoPropuesto.REEMPLAZADO, resueltoEn: new Date() },
    });
    await tx.resultadoPropuesto.create({
      data: { organizacionId, partidoId: partido.id, jugadorId, cargadoPorId: usuarioId, datos },
    });
  });

  const { esA, yo, rival } = lados(partido, jugadorId);
  avisar(avisoDeResultadoCargado(yo, rival, marcadorDesde(datos, !esA)));
  return misPartidos(slug, usuarioId);
}

// El rival confirma el resultado pendiente: desde ahí cuenta, como si lo hubiera cargado la organización.
export async function confirmarResultadoDelJugador(slug: string, usuarioId: number, partidoId: number): Promise<RespuestaMisPartidos> {
  const { organizacionId, jugadorId, partido } = await partidoDelJugador(slug, usuarioId, partidoId);
  const problema = problemaAlResponder(partido, jugadorId, propuestasLeidas(partido));
  if (problema) throw new ErrorHttp(409, problema);
  const pendiente = partido.resultadosPropuestos.find((p) => p.estado === EstadoResultadoPropuesto.PENDIENTE)!;

  await aplicarPropuesta(organizacionId, partido, pendiente, usuarioId);

  const { yo, rival } = lados(partido, jugadorId);
  avisar(avisoDeResultadoConfirmado(yo, rival));
  return misPartidos(slug, usuarioId);
}

// El rival dice que no fue así. No cuenta, y cualquiera de los dos puede volver a cargarlo.
export async function rechazarResultadoDelJugador(slug: string, usuarioId: number, partidoId: number): Promise<RespuestaMisPartidos> {
  const { jugadorId, partido } = await partidoDelJugador(slug, usuarioId, partidoId);
  const problema = problemaAlResponder(partido, jugadorId, propuestasLeidas(partido));
  if (problema) throw new ErrorHttp(409, problema);
  const pendiente = partido.resultadosPropuestos.find((p) => p.estado === EstadoResultadoPropuesto.PENDIENTE)!;

  const { count } = await prisma.resultadoPropuesto.updateMany({
    where: { id: pendiente.id, estado: EstadoResultadoPropuesto.PENDIENTE },
    data: { estado: EstadoResultadoPropuesto.RECHAZADO, resueltoPorId: usuarioId, resueltoEn: new Date() },
  });
  if (count === 0) throw new ErrorHttp(409, 'RESULTADO_CAMBIO');

  const { yo, rival } = lados(partido, jugadorId);
  avisar(avisoDeResultadoRechazado(yo, rival));
  return misPartidos(slug, usuarioId);
}

// La organización confirma el resultado que cargó un jugador, cuando el rival no responde o no
// tiene la app. Es lo mismo que cargarlo ella, sin volver a tipearlo.
export async function confirmarResultadoPorLaOrganizacion(slug: string, usuarioId: number, torneoId: number, partidoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!Number.isInteger(torneoId) || !Number.isInteger(partidoId)) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const partido = await prisma.partido.findFirst({
    where: { id: partidoId, torneoId, torneo: { organizacionId } },
    select: DEL_PARTIDO,
  });
  if (!partido) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const pendiente = partido.resultadosPropuestos.find((p) => p.estado === EstadoResultadoPropuesto.PENDIENTE);
  if (!pendiente) throw new ErrorHttp(409, 'SIN_RESULTADO_PENDIENTE');

  const guardado = await aplicarPropuesta(organizacionId, partido, pendiente, usuarioId);

  // Le avisa a quien lo cargó, como si lo hubiera confirmado el rival.
  const cargo = pendiente.jugadorId === partido.jugadorAId ? partido.jugadorA! : partido.jugadorB!;
  avisar(avisoDeResultadoConfirmado({ usuarioId: null, nombre: 'La organización' }, cargo));
  return guardado;
}

// Aplica el resultado pendiente y lo marca confirmado, en la misma transacción: si otro lo resolvió
// mientras tanto, no se guarda nada.
async function aplicarPropuesta(
  organizacionId: number,
  partido: Partido,
  propuesta: Partido['resultadosPropuestos'][number],
  usuarioId: number,
) {
  return aplicarResultado(organizacionId, partido.torneoId, partido.id, datosDeLaPropuesta(propuesta), async (tx) => {
    const { count } = await tx.resultadoPropuesto.updateMany({
      where: { id: propuesta.id, estado: EstadoResultadoPropuesto.PENDIENTE },
      data: { estado: EstadoResultadoPropuesto.CONFIRMADO, resueltoPorId: usuarioId, resueltoEn: new Date() },
    });
    if (count === 0) throw new ErrorHttp(409, 'RESULTADO_CAMBIO');
  });
}
