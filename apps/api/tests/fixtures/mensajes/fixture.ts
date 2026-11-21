// Los chats del eval de F19, con lo que se espera de cada mensaje. Los usan el eval, contra la IA
// real, y un test de la auditoría, con la respuesta perfecta.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SistemaDeJuego } from '@setpoint/shared';
import { nombresRepetidos, type ContextoAuditoria, type JugadorDelTorneo } from '../../../src/modules/competencia/mensajes/auditar';
import { leerChat } from '../../../src/modules/competencia/mensajes/leer-chat';
import type { PartidoParaLaIA } from '../../../src/modules/competencia/mensajes/prompt';
import type { ResultadoDeLaIA } from '../../../src/modules/competencia/mensajes/schema-respuesta';

export type Esperado = {
  mensaje: number;
  partidoId: number;
  tipo: ResultadoDeLaIA['tipo'];
  ganador: 'A' | 'B';
  // null si el mensaje no dice los games: no se puede cargar solo.
  sets: [number, number][] | null;
  seCargaSolo: boolean;
};

export type ChatDePrueba = {
  nombre: string;
  descripcion: string;
  sistema: SistemaDeJuego;
  partidos: { id: number; donde: string; a: string; b: string }[];
  chat: string[];
  esperado: Esperado[];
};

const CARPETA = __dirname;

export const chatsDePrueba = (): ChatDePrueba[] =>
  readdirSync(CARPETA)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ nombre: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(CARPETA, f), 'utf8')) }));

// Los jugadores del chat se arman desde los nombres: "Diego Antileo" es nombre y apellido.
export function contextoDe(prueba: ChatDePrueba) {
  const jugadores = new Map<string, JugadorDelTorneo>();
  const jugador = (nombreCompleto: string) => {
    if (!jugadores.has(nombreCompleto)) {
      const [nombre, ...apellido] = nombreCompleto.split(' ');
      jugadores.set(nombreCompleto, { id: jugadores.size + 1, nombre, apellido: apellido.join(' ') });
    }
    return jugadores.get(nombreCompleto)!;
  };
  const partidos = prueba.partidos.map((p) => ({
    id: p.id,
    jugadorA: jugador(p.a),
    jugadorB: jugador(p.b),
    estado: 'otro' as const,
    ganadorId: null,
    sets: [],
  }));
  const mensajes = leerChat(prueba.chat.join('\n'));
  const contexto: ContextoAuditoria = {
    mensajes: new Map(mensajes.map((m) => [m.numero, m])),
    partidos: new Map(partidos.map((p) => [p.id, p])),
    sistema: prueba.sistema,
    repetidos: nombresRepetidos([...jugadores.values()]),
  };
  const paraLaIA: PartidoParaLaIA[] = prueba.partidos.map((p) => ({ ...p, conResultado: false }));
  return { contexto, mensajes, paraLaIA };
}

// La respuesta que daría una IA perfecta.
export const respuestaPerfecta = (prueba: ChatDePrueba): ResultadoDeLaIA[] =>
  prueba.esperado.map((e) => ({
    mensaje: e.mensaje,
    partidoId: e.partidoId,
    tipo: e.tipo,
    ganador: e.ganador,
    sets: (e.sets ?? []).map(([gamesA, gamesB], i) => ({
      gamesA,
      gamesB,
      esSuperTieBreak: prueba.sistema.terceroSet === 'super_tiebreak' && i + 1 === prueba.sistema.setsPorPartido,
    })),
    confianza: e.sets === null ? 'baja' : 'alta',
  }));
