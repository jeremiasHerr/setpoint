import { EstadoJugador, type Prisma } from '@prisma/client';

// Qué es "el padrón", en un solo lugar (decisión 054). Un perfil pendiente (la solicitud o la reserva
// de alguien que todavía no pagó) o uno descartado existe en la base, pero no es del padrón: no
// aparece en el ranking, la búsqueda, el sorteo ni ninguna vista pública. Solo lo ve la organización,
// en las solicitudes.

// Todo el padrón, con los dados de baja: lo que ve la organización en su pantalla Padrón.
export const DEL_PADRON = { estado: EstadoJugador.PADRON } satisfies Prisma.JugadorWhereInput;

// Los que juegan hoy: sin los dados de baja. Ranking, búsqueda, sorteo, links y perfiles de la cuenta.
export const DEL_PADRON_ACTIVOS = { ...DEL_PADRON, activo: true } satisfies Prisma.JugadorWhereInput;

export function esDelPadron(jugador: { estado: EstadoJugador }) {
  return jugador.estado === EstadoJugador.PADRON;
}
