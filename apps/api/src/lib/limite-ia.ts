import type { FuncionIA } from '@prisma/client';
import { ErrorHttp } from '../middleware/errores';
import { prisma } from './prisma';
import { costoUsd, MODELO_IMPORTACION, MODELO_MENSAJES, type Modelo } from './ia';

// Límites de las llamadas a un modelo (decisión 121), para la importación de la planilla y los
// resultados desde los mensajes. Cada pedido deja una fila en UsoIA, con los tokens que devolvió la
// respuesta: de ahí salen el límite de pedidos por usuario y el tope de gasto por organización, y
// sobreviven a un reinicio. La segunda capa, por usuario y en memoria, está en middleware/limite.ts.

export type ConfigLimitesIA = {
  pedidosPorHora: number;
  topeDiarioUsd: number;
};

// El modelo de cada funcionalidad (decisión 141): el gasto de cada pedido se cuenta con su precio.
const MODELO_DE: Record<FuncionIA, Modelo> = { IMPORTACION: MODELO_IMPORTACION, RESULTADOS: MODELO_MENSAJES };

// Cuántos pedidos y cuánta plata ya se usaron en la ventana de cada límite.
export type UsoReciente = { pedidosDelUsuario: number; gastoDeLaOrganizacionUsd: number };

const HORA_MS = 3_600_000;
const DIA_MS = 24 * HORA_MS;

function numero(valor: string | undefined, porDefecto: number) {
  const n = Number(valor);
  return valor !== undefined && valor.trim() !== '' && Number.isFinite(n) && n > 0 ? n : porDefecto;
}

// Alcanzan para la demo: una planilla de 77 jugadores cuesta unos US$ 0,06, y una lectura de mensajes,
// unos US$ 0,02. Ver .env.example.
export function leerConfigLimitesIA(env: Record<string, string | undefined> = process.env): ConfigLimitesIA {
  return {
    pedidosPorHora: Math.floor(numero(env.IA_PEDIDOS_POR_HORA, 10)),
    topeDiarioUsd: numero(env.IA_TOPE_DIARIO_USD, 2),
  };
}

// Lo que gastó la organización: la suma de cada funcionalidad, con el precio de su modelo.
export function gastoUsd(porFuncion: { funcion: FuncionIA; entrada: number; salida: number }[]) {
  return porFuncion.reduce((suma, f) => suma + costoUsd({ entrada: f.entrada, salida: f.salida }, MODELO_DE[f.funcion]), 0);
}

// Qué límite se pasó, si alguno. El del usuario va primero: es el que se arregla esperando un rato.
export function limitePasado(uso: UsoReciente, config: ConfigLimitesIA): 'LIMITE_DE_PEDIDOS_IA' | 'TOPE_DE_GASTO_IA' | null {
  if (uso.pedidosDelUsuario >= config.pedidosPorHora) return 'LIMITE_DE_PEDIDOS_IA';
  if (uso.gastoDeLaOrganizacionUsd >= config.topeDiarioUsd) return 'TOPE_DE_GASTO_IA';
  return null;
}

// Sin clave no se llama a ningún modelo: no hay nada que limitar y todo sigue como antes.
const hayModelo = () => Boolean(process.env.ANTHROPIC_API_KEY);

// Antes de llamar al modelo: si hay lugar, anota el pedido (con 0 tokens, para que cuenten también
// los que todavía están en curso) y devuelve su id; si no, 429. Un pedido es una subida o una
// lectura, aunque haga varias llamadas o reintente.
export async function reservarUsoIA(organizacionId: number, usuarioId: number, funcion: FuncionIA, ahora = new Date()): Promise<number | null> {
  if (!hayModelo()) return null;
  const config = leerConfigLimitesIA();
  const [pedidosDelUsuario, gasto] = await Promise.all([
    prisma.usoIA.count({ where: { usuarioId, creadoEn: { gte: new Date(ahora.getTime() - HORA_MS) } } }),
    prisma.usoIA.groupBy({
      by: ['funcion'],
      where: { organizacionId, creadoEn: { gte: new Date(ahora.getTime() - DIA_MS) } },
      _sum: { tokensEntrada: true, tokensSalida: true },
    }),
  ]);
  const gastoDeLaOrganizacionUsd = gastoUsd(
    gasto.map((g) => ({ funcion: g.funcion, entrada: g._sum.tokensEntrada ?? 0, salida: g._sum.tokensSalida ?? 0 })),
  );
  const pasado = limitePasado({ pedidosDelUsuario, gastoDeLaOrganizacionUsd }, config);
  if (pasado) throw new ErrorHttp(429, pasado);
  return (await prisma.usoIA.create({ data: { organizacionId, usuarioId, funcion } })).id;
}

// Después de la respuesta: los tokens que devolvió el modelo.
export async function registrarTokensIA(usoId: number | null, tokens: { entrada: number; salida: number }) {
  if (usoId === null) return;
  await prisma.usoIA.update({ where: { id: usoId }, data: { tokensEntrada: tokens.entrada, tokensSalida: tokens.salida } });
}
