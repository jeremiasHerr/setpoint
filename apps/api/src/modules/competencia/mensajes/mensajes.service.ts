import { EstadoPartido, EstadoProcesoIA, FasePartido, type Prisma } from '@prisma/client';
import {
  nombreCuadroConsuelo,
  type DatosResultado,
  type EstadoResultadoLeido,
  type LecturaDeMensajes,
  type ResultadoLeido,
} from '@setpoint/shared';
import { intentarJson, MODELO, type Tokens } from '../../../lib/ia';
import { organizacionAdministrada } from '../../../lib/permisos';
import { prisma } from '../../../lib/prisma';
import { ErrorHttp } from '../../../middleware/errores';
import {
  aPartidoDeLaLista,
  DE_LA_LISTA,
  guardarResultado,
  nombreDelTorneo,
  sistemaDeJuego,
  torneoDeLaOrganizacion,
} from '../resultados.service';
import {
  auditarLectura,
  nombresRepetidos,
  problemasGlobales,
  type ContextoAuditoria,
  type PartidoAuditable,
} from './auditar';
import { leerChat, type MensajeDelChat } from './leer-chat';
import { armarMensaje, INSTRUCCIONES, VERSION_PROMPT } from './prompt';
import { respuestaMensajesSchema, type RespuestaMensajes } from './schema-respuesta';

// F19 — Resultados desde los mensajes del grupo (06-ia.md §2, decisión 119). Cada lectura es una
// fila de ExtraccionResultado, con los resultados que se leyeron en el resumen. Lo que pasa todos
// los controles se carga solo, con el mismo guardarResultado que la carga a mano: valida igual,
// respeta la decisión 028, hace avanzar el cuadro y recalcula los puntos.

type ResultadoGuardado = {
  n: number;
  mensaje: number;
  partidoId: number | null;
  resultado: DatosResultado | null;
  estado: EstadoResultadoLeido;
  motivo: string | null;
  cargadoAMano: boolean;
};

type ResumenLectura = {
  mensajes: MensajeDelChat[];
  resultados: ResultadoGuardado[];
  modelo: string;
  versionPrompt: string;
  tokens: Tokens;
  intentos: number;
  error: string | null;
};

const MAXIMO_INTENTOS = 2;

const DEL_PARTIDO = {
  ...DE_LA_LISTA,
  sets: { select: { gamesA: true, gamesB: true, tieBreakA: true, tieBreakB: true, esSuperTieBreak: true }, orderBy: { numero: 'asc' } },
} satisfies Prisma.PartidoSelect;
type PartidoLeido = Prisma.PartidoGetPayload<{ select: typeof DEL_PARTIDO }>;

const CON_RESULTADO: Partial<Record<EstadoPartido, PartidoAuditable['estado']>> = {
  [EstadoPartido.JUGADA]: 'jugada',
  [EstadoPartido.WALKOVER]: 'walkover',
  [EstadoPartido.ABANDONO]: 'abandono',
};

// Dónde se juega, para que la IA ubique el partido: "Zona B", "Campeonato, ronda 2".
// El cuadro consuelo lleva el nombre que le da la organización, que es el que usan los jugadores en sus mensajes.
const donde = (p: PartidoLeido, consuelo: string) =>
  p.fase === FasePartido.GRUPOS
    ? `Zona ${p.grupo}`
    : `${p.cuadro ? (p.cuadro === 'CAMPEONATO' ? 'Campeonato' : consuelo) : 'Cuadro'}, ronda ${p.ronda}`;

const nombre = (j: { nombre: string; apellido: string } | null) => (j ? `${j.nombre} ${j.apellido}` : 'a definir');

// Por qué no se pudo guardar un resultado que pasó la auditoría: lo que dice guardarResultado.
const MOTIVO_AL_GUARDAR: Record<string, string> = {
  CORRECCION_CAMBIA_LOS_CUADROS: 'Cambiaría los cuadros que ya se armaron con las zonas',
  RESULTADO_DESACTUALIZADO: 'El partido cambió mientras lo cargábamos',
  PARTIDO_SIN_JUGADORES: 'El partido todavía no tiene a sus dos jugadores',
  TORNEO_CANCELADO: 'El torneo está cancelado',
  PARTIDO_CANCELADO: 'El partido está cancelado',
  DATOS_INVALIDOS: 'El resultado no es válido para este torneo',
};

const motivoAlGuardar = (err: unknown) =>
  err instanceof ErrorHttp ? MOTIVO_AL_GUARDAR[err.codigo] ?? `No se pudo cargar (${err.codigo})` : 'No se pudo cargar';

async function partidosDelTorneo(torneoId: number) {
  return prisma.partido.findMany({
    where: { torneoId, estado: { not: EstadoPartido.CANCELADA } },
    orderBy: [{ fase: 'asc' }, { grupo: 'asc' }, { cuadro: 'asc' }, { ronda: 'asc' }, { ordenEnRonda: 'asc' }, { id: 'asc' }],
    select: DEL_PARTIDO,
  });
}

function comoAuditable(p: PartidoLeido): PartidoAuditable {
  return {
    id: p.id,
    jugadorA: p.jugadorA,
    jugadorB: p.jugadorB,
    estado: CON_RESULTADO[p.estado] ?? 'otro',
    ganadorId: p.ganadorId,
    sets: p.sets,
  };
}

async function lecturaDe(organizacionId: number, torneoId: number, id: number) {
  const lectura = Number.isInteger(id)
    ? await prisma.extraccionResultado.findFirst({ where: { id, organizacionId, torneoId } })
    : null;
  if (!lectura) throw new ErrorHttp(404, 'LECTURA_NO_ENCONTRADA');
  return lectura;
}

async function vista(lectura: { id: number; torneoId: number; estado: EstadoProcesoIA; resumen: Prisma.JsonValue; creadoEn: Date }, nombreTorneo: string, consuelo: string): Promise<LecturaDeMensajes> {
  const resumen = (lectura.resumen ?? {}) as Partial<ResumenLectura>;
  const mensajes = new Map((resumen.mensajes ?? []).map((m) => [m.numero, m]));
  const ids = (resumen.resultados ?? []).flatMap((r) => (r.partidoId === null ? [] : [r.partidoId]));
  // Los partidos como están ahora: un resultado cargado a mano después se ve.
  const partidos = new Map(
    (await prisma.partido.findMany({ where: { id: { in: ids }, torneoId: lectura.torneoId }, select: DE_LA_LISTA })).map((p) => [p.id, p]),
  );

  const resultados: ResultadoLeido[] = (resumen.resultados ?? []).map((r) => {
    const mensaje = mensajes.get(r.mensaje);
    const partido = r.partidoId === null ? undefined : partidos.get(r.partidoId);
    return {
      n: r.n,
      mensaje: r.mensaje,
      hora: mensaje?.hora ?? null,
      remitente: mensaje?.remitente ?? null,
      texto: mensaje?.texto ?? '',
      partido: partido ? aPartidoDeLaLista(partido) : null,
      resultado: r.resultado,
      estado: r.estado,
      motivo: r.motivo,
      cargadoAMano: r.cargadoAMano,
    };
  });

  return {
    id: lectura.id,
    torneoId: lectura.torneoId,
    nombre: nombreTorneo,
    nombreCuadroConsuelo: consuelo,
    estado: lectura.estado === EstadoProcesoIA.ERROR ? 'ERROR' : 'PROCESADO',
    error: resumen.error ?? null,
    mensajes: resumen.mensajes?.length ?? 0,
    resultados,
    creadoEn: lectura.creadoEn.toISOString(),
  };
}

// Lee los mensajes con IA, audita cada resultado y carga solo lo que pasa todos los controles. Lo
// demás queda en la lectura para que la organización lo cargue o lo descarte.
export async function leerMensajes(slug: string, usuarioId: number, torneoId: number, texto: string): Promise<LecturaDeMensajes> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  const partidos = await partidosDelTorneo(torneo.id);
  if (partidos.length === 0) throw new ErrorHttp(409, 'TORNEO_SIN_PARTIDOS');

  const mensajes = leerChat(texto);
  if (mensajes.length === 0) throw new ErrorHttp(400, 'DATOS_INVALIDOS', { texto: 'Pegá los mensajes del grupo' });

  const sistema = sistemaDeJuego(torneo);
  const jugadores = [...new Map(partidos.flatMap((p) => [p.jugadorA, p.jugadorB]).filter((j) => j !== null).map((j) => [j.id, j])).values()];
  const contexto: ContextoAuditoria = {
    mensajes: new Map(mensajes.map((m) => [m.numero, m])),
    partidos: new Map(partidos.map((p) => [p.id, comoAuditable(p)])),
    sistema,
    repetidos: nombresRepetidos(jugadores),
  };
  const pedido = armarMensaje({
    torneo: nombreDelTorneo(torneo),
    sistema,
    partidos: partidos.map((p) => ({ id: p.id, donde: donde(p, nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo)), a: nombre(p.jugadorA), b: nombre(p.jugadorB), conResultado: p.estado in CON_RESULTADO })),
    mensajes,
  });

  // Capas 1 a 3 y el reintento: como la importación (06-ia.md §1). Solo se reintenta una respuesta
  // que habla de mensajes o partidos que no existen; un resultado dudoso lo decide la organización.
  const resumen: ResumenLectura = { mensajes, resultados: [], modelo: MODELO, versionPrompt: VERSION_PROMPT, tokens: { entrada: 0, salida: 0 }, intentos: 0, error: null };
  const crudos: string[] = [];
  let respuesta: RespuestaMensajes | null = null;
  let feedback: string[] = [];
  while (resumen.intentos < MAXIMO_INTENTOS && respuesta === null) {
    const conFeedback = feedback.length === 0 ? pedido : `${pedido}\n\nTu respuesta anterior tuvo estos problemas:\n${feedback.map((p) => `- ${p}`).join('\n')}`;
    const r = await intentarJson(respuestaMensajesSchema, INSTRUCCIONES, conFeedback);
    resumen.intentos++;
    if (r.crudo !== undefined) crudos.push(r.crudo);
    if (r.tokens) {
      resumen.tokens.entrada += r.tokens.entrada;
      resumen.tokens.salida += r.tokens.salida;
    }
    if (!r.ok) {
      feedback = [r.error];
      continue;
    }
    feedback = problemasGlobales(r.datos, contexto);
    if (feedback.length === 0) respuesta = r.datos;
  }
  if (respuesta === null) resumen.error = feedback.join('. ') || 'No pudimos leer los mensajes';

  const lectura = await prisma.extraccionResultado.create({
    data: {
      organizacionId,
      torneoId: torneo.id,
      creadoPorId: usuarioId,
      entradaCruda: texto,
      respuestaCruda: crudos,
      estado: respuesta ? EstadoProcesoIA.PROCESADO : EstadoProcesoIA.ERROR,
      resumen: resumen as unknown as Prisma.InputJsonValue,
    },
  });

  if (respuesta) {
    const auditados = auditarLectura(respuesta, contexto);
    // De a uno: cada resultado puede hacer avanzar un cuadro que lee el siguiente.
    for (const [i, r] of respuesta.resultados.entries()) {
      const auditado = auditados[i];
      const guardado: ResultadoGuardado = {
        n: i + 1,
        mensaje: r.mensaje,
        partidoId: r.partidoId,
        resultado: auditado.resultado,
        estado: auditado.estado === 'seguro' ? 'cargado' : auditado.estado,
        motivo: auditado.motivo,
        cargadoAMano: false,
      };
      if (auditado.estado === 'seguro') {
        try {
          await guardarResultado(slug, usuarioId, torneo.id, r.partidoId!, auditado.resultado);
        } catch (err) {
          Object.assign(guardado, { estado: 'a_revisar', motivo: motivoAlGuardar(err) });
        }
      }
      resumen.resultados.push(guardado);
    }
    await prisma.extraccionResultado.update({ where: { id: lectura.id }, data: { resumen: resumen as unknown as Prisma.InputJsonValue } });
  }

  return vista({ ...lectura, resumen: resumen as unknown as Prisma.JsonValue }, nombreDelTorneo(torneo), nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo));
}

export async function obtenerLectura(slug: string, usuarioId: number, torneoId: number, id: number) {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  return vista(await lecturaDe(organizacionId, torneo.id, id), nombreDelTorneo(torneo), nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo));
}

// La organización carga tal como se leyó, o descarta, un resultado que quedó para revisar. Para
// cambiarlo antes de cargarlo está Cargar resultado.
export async function decidirResultado(
  slug: string,
  usuarioId: number,
  torneoId: number,
  id: number,
  n: number,
  accion: 'cargar' | 'descartar',
): Promise<LecturaDeMensajes> {
  const organizacionId = await organizacionAdministrada(slug, usuarioId);
  const torneo = await torneoDeLaOrganizacion(organizacionId, torneoId);
  const lectura = await lecturaDe(organizacionId, torneo.id, id);
  const resumen = (lectura.resumen ?? {}) as Partial<ResumenLectura>;
  const resultado = resumen.resultados?.find((r) => r.n === n);
  if (!resultado) throw new ErrorHttp(404, 'RESULTADO_NO_ENCONTRADO');
  if (resultado.estado !== 'a_revisar') throw new ErrorHttp(409, 'RESULTADO_YA_DECIDIDO');

  if (accion === 'cargar') {
    if (resultado.partidoId === null || resultado.resultado === null) throw new ErrorHttp(409, 'RESULTADO_INCOMPLETO');
    // Si no se puede guardar, el error de la carga llega tal cual: la lectura no cambia.
    await guardarResultado(slug, usuarioId, torneo.id, resultado.partidoId, resultado.resultado);
    Object.assign(resultado, { estado: 'cargado', cargadoAMano: true });
  } else {
    resultado.estado = 'descartado';
  }

  const guardada = await prisma.extraccionResultado.update({
    where: { id: lectura.id },
    data: { resumen: resumen as unknown as Prisma.InputJsonValue },
  });
  return vista(guardada, nombreDelTorneo(torneo), nombreCuadroConsuelo(torneo.organizacion.nombreCuadroConsuelo));
}
