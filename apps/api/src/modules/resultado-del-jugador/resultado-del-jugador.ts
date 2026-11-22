// El resultado que carga un jugador desde la app (decisión 127). Lógica pura: qué se puede hacer
// con el resultado de un partido y cómo se lee lo que se guardó. No toca la base.
import { ganadorDeLosSets, resultadoDelJugadorSchema, type DatosResultadoDelJugador } from '@setpoint/shared';
import type { EstadoPartido } from '../competencia/clasificacion';

const CON_RESULTADO: EstadoPartido[] = ['JUGADA', 'WALKOVER', 'ABANDONO'];

export type PropuestaLeida = {
  id: number;
  // El perfil del jugador que la cargó.
  jugadorId: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO' | 'REEMPLAZADO';
  datos: unknown;
};

export type PartidoParaCargar = {
  jugadorAId: number | null;
  jugadorBId: number | null;
  estado: EstadoPartido;
};

// Los datos guardados vuelven a pasar por el schema: la columna es JSON y no tiene tipo.
export function datosDeLaPropuesta(propuesta: Pick<PropuestaLeida, 'datos'>): DatosResultadoDelJugador {
  return resultadoDelJugadorSchema.parse(propuesta.datos);
}

// Quién gana con ese resultado: el de los sets en un partido jugado, quien siguió en un abandono.
export function ganadorDeLaPropuesta(datos: DatosResultadoDelJugador, jugadorAId: number, jugadorBId: number) {
  if (datos.tipo === 'abandono') return datos.ganadorId;
  return ganadorDeLosSets(datos.sets) === 'A' ? jugadorAId : jugadorBId;
}

// La que importa del partido: la pendiente, o la última rechazada si no hay pendiente. Las
// confirmadas ya son el resultado, y las reemplazadas no dicen nada.
export function propuestaVigente(propuestas: PropuestaLeida[]): PropuestaLeida | null {
  const vivas = propuestas.filter((p) => p.estado === 'PENDIENTE' || p.estado === 'RECHAZADO');
  return vivas.find((p) => p.estado === 'PENDIENTE') ?? vivas.sort((a, b) => b.id - a.id)[0] ?? null;
}

// Por qué un jugador no puede cargar el resultado de su partido, o null si puede. La corrección de
// un resultado que ya cuenta es de la organización (decisión 028).
export function problemaAlCargar(
  partido: PartidoParaCargar,
  jugadorId: number,
  jugadoresCarganResultados: boolean,
  propuestas: PropuestaLeida[],
) {
  if (!jugadoresCarganResultados) return 'LA_ORGANIZACION_CARGA_LOS_RESULTADOS';
  if (partido.estado === 'CANCELADA') return 'PARTIDO_CANCELADO';
  if (CON_RESULTADO.includes(partido.estado)) return 'PARTIDO_CON_RESULTADO';
  if (partido.jugadorAId === null || partido.jugadorBId === null) return 'PARTIDO_SIN_JUGADORES';
  // Si el rival ya cargó uno, primero lo confirma o lo rechaza.
  const pendiente = propuestas.find((p) => p.estado === 'PENDIENTE');
  if (pendiente && pendiente.jugadorId !== jugadorId) return 'EL_RIVAL_YA_CARGO_EL_RESULTADO';
  return null;
}

// Por qué un jugador no puede confirmar o rechazar el resultado pendiente, o null si puede. Solo
// responde el que no lo cargó.
export function problemaAlResponder(partido: PartidoParaCargar, jugadorId: number, propuestas: PropuestaLeida[]) {
  if (CON_RESULTADO.includes(partido.estado)) return 'PARTIDO_CON_RESULTADO';
  const pendiente = propuestas.find((p) => p.estado === 'PENDIENTE');
  if (!pendiente) return 'SIN_RESULTADO_PENDIENTE';
  if (pendiente.jugadorId === jugadorId) return 'LO_CARGASTE_VOS';
  return null;
}
