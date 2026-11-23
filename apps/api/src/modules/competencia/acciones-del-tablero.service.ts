import { EstadoPartido, EstadoTorneo, FasePartido, TipoEventoCoordinacion } from '@prisma/client';
import { nombreCuadroConsuelo, type DatosExtenderPlazo, type RecordatorioEnviado, type Tablero } from '@setpoint/shared';
import { enviarCorreo } from '../../lib/correo';
import { hoy } from '../../lib/fechas';
import { organizacionAdministrada } from '../../lib/permisos';
import { prisma } from '../../lib/prisma';
import { ErrorHttp } from '../../middleware/errores';
import { enviarAvisos } from '../avisos/avisos.service';
import { nombreDeRonda } from '../jugador/mis-partidos';
import { obtenerTablero } from './tablero.service';

// Dos acciones del tablero sobre un partido que todavía no se jugó (decisión 135): extender su
// plazo y recordarles a los dos que les falta. El doble W.O. es un resultado más y se carga desde
// Cargar resultado, como el W.O. (decisión 062).

const RESUELTO: EstadoPartido[] = [EstadoPartido.JUGADA, EstadoPartido.WALKOVER, EstadoPartido.ABANDONO, EstadoPartido.DOBLE_WALKOVER];
const EN_JUEGO: EstadoTorneo[] = [EstadoTorneo.ZONAS_GENERADAS, EstadoTorneo.GRUPOS_EN_CURSO, EstadoTorneo.ELIMINATORIAS];

const JUGADOR = { select: { nombre: true, apellido: true, usuario: { select: { id: true, email: true } } } } as const;

// El partido, dentro de un torneo de la organización que se está jugando, sin resultado y con
// sus dos jugadores. El filtro por organización es el aislamiento: el id solo no alcanza.
async function partidoPendiente(slug: string, usuarioId: number, torneoId: number, partidoId: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  if (!Number.isInteger(torneoId) || !Number.isInteger(partidoId)) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  const partido = await prisma.partido.findFirst({
    where: { id: partidoId, torneo: { id: torneoId, organizacionId } },
    include: {
      jugadorA: JUGADOR,
      jugadorB: JUGADOR,
      torneo: {
        select: {
          estado: true,
          nombre: true,
          edicion: true,
          categoria: { select: { nombre: true } },
          organizacion: { select: { nombre: true, nombreCuadroConsuelo: true } },
        },
      },
    },
  });
  if (!partido) throw new ErrorHttp(404, 'PARTIDO_NO_ENCONTRADO');
  if (!EN_JUEGO.includes(partido.torneo.estado)) throw new ErrorHttp(409, 'TORNEO_NO_EN_JUEGO');
  if (partido.estado === EstadoPartido.CANCELADA) throw new ErrorHttp(409, 'PARTIDO_CANCELADO');
  if (RESUELTO.includes(partido.estado)) throw new ErrorHttp(409, 'PARTIDO_CON_RESULTADO');
  const { jugadorA, jugadorB } = partido;
  if (!jugadorA || !jugadorB) throw new ErrorHttp(409, 'PARTIDO_SIN_JUGADORES');
  return { ...partido, jugadorA, jugadorB };
}

// Las fechas límite se guardan como el día, a medianoche UTC, igual que las que escribe el sorteo.
const aDia = (fecha: Date) => fecha.toISOString().slice(0, 10);

// Corre la fecha límite de un partido (02-dominio §8.4: "en la práctica agregan días"). Solo hacia
// adelante, y queda en el historial de coordinación (decisión 066).
export async function extenderPlazo(
  slug: string,
  usuarioId: number,
  torneoId: number,
  partidoId: number,
  { fechaLimite }: DatosExtenderPlazo,
): Promise<Tablero> {
  const partido = await partidoPendiente(slug, usuarioId, torneoId, partidoId);
  const actual = partido.fechaLimite ? aDia(partido.fechaLimite) : null;
  if (fechaLimite < hoy() || (actual !== null && fechaLimite <= actual)) {
    throw new ErrorHttp(400, 'DATOS_INVALIDOS', {
      fechaLimite: actual !== null && actual >= hoy() ? 'Tiene que ser después del plazo actual' : 'No puede ser una fecha pasada',
    });
  }

  const nueva = new Date(`${fechaLimite}T00:00:00.000Z`);
  await prisma.$transaction([
    prisma.partido.update({ where: { id: partido.id }, data: { fechaLimite: nueva } }),
    prisma.eventoCoordinacion.create({
      data: {
        partidoId: partido.id,
        tipo: TipoEventoCoordinacion.PLAZO_EXTENDIDO,
        usuarioId,
        porOrganizacion: true,
        fechaLimite: nueva,
      },
    }),
  ]);
  return obtenerTablero(slug, usuarioId, torneoId);
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const diaConSemana = (dia: string) => {
  const fecha = new Date(`${dia}T12:00:00.000Z`);
  return `${DIAS[fecha.getUTCDay()]} ${fecha.getUTCDate()}`;
};

// Les avisa a los dos jugadores que les falta este partido: un aviso a quien tiene la app y un
// email a quien tiene cuenta (decisión 135). A quien no tiene ninguna de las dos se le escribe por
// WhatsApp, con "Escribirles" (decisión 062). Un aviso o un email que no sale no es un error: se
// sigue con el resto, como en el resto de los avisos.
export async function recordarPartido(slug: string, usuarioId: number, torneoId: number, partidoId: number): Promise<RecordatorioEnviado> {
  const partido = await partidoPendiente(slug, usuarioId, torneoId, partidoId);
  const { torneo } = partido;
  const nombreTorneo = `${torneo.edicion ?? torneo.nombre} · ${torneo.categoria.nombre}`;
  let donde = `zona ${partido.grupo}`;
  if (partido.fase !== FasePartido.GRUPOS) {
    const rondas = await prisma.partido.aggregate({ where: { torneoId, cuadro: partido.cuadro }, _max: { ronda: true } });
    const cuadro = partido.cuadro === 'CAMPEONATO' ? 'Campeonato' : nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo);
    donde = `${cuadro}, ${nombreDeRonda(partido.ronda!, rondas._max.ronda ?? partido.ronda!)}`;
  }
  const plazo = partido.fechaLimite ? ` Tienen hasta el ${diaConSemana(aDia(partido.fechaLimite))} para jugarlo.` : '';

  const lados = [
    { yo: partido.jugadorA, rival: partido.jugadorB },
    { yo: partido.jugadorB, rival: partido.jugadorA },
  ];
  const conCuenta = lados.filter((l) => l.yo.usuario !== null).map((l) => l.yo.usuario!.id);
  const dispositivos = await prisma.dispositivoAviso.findMany({ where: { usuarioId: { in: conCuenta } }, select: { usuarioId: true } });
  const conApp = new Set(dispositivos.map((d) => d.usuarioId));

  const enviado: RecordatorioEnviado = { conAviso: [], conEmail: [], sinCanal: [] };
  const avisos = [];
  for (const { yo, rival } of lados) {
    const texto = `Te falta jugar con ${rival.nombre} ${rival.apellido}, en ${nombreTorneo} (${donde}).${plazo}`;
    if (yo.usuario && conApp.has(yo.usuario.id)) {
      avisos.push({ usuarioId: yo.usuario.id, titulo: `Te falta el partido con ${rival.apellido}`, cuerpo: texto });
      enviado.conAviso.push(yo.apellido);
    }
    if (yo.usuario) {
      try {
        await enviarCorreo({
          para: yo.usuario.email,
          asunto: `Te falta el partido con ${rival.nombre} ${rival.apellido}`,
          texto: `Hola, ${yo.nombre}.\n\n${texto}\n\nTe lo recuerda ${torneo.organizacion.nombre}, desde Setpoint.`,
        });
        enviado.conEmail.push(yo.apellido);
      } catch (error) {
        console.error('No se pudo mandar el recordatorio por email', error);
      }
    }
    if (!enviado.conAviso.includes(yo.apellido) && !enviado.conEmail.includes(yo.apellido)) enviado.sinCanal.push(yo.apellido);
  }
  await enviarAvisos(avisos);
  return enviado;
}
