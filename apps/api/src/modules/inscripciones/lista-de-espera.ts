// La lista de espera de un torneo (F13). Lógica pura: recibe lo ya leído. No toca la base.

type TorneoQueSeModifica = { estado: string; sorteoConfirmado: boolean };

// Dar de baja e inscribir a mano se puede mientras todavía se puede reemplazar a alguien: con la
// inscripción abierta o cerrada, hasta que se confirma el sorteo (decisión 077). Después, quien no
// juega pierde sus partidos por W.O. desde el tablero.
export function sePuedeModificar(torneo: TorneoQueSeModifica) {
  return !torneo.sorteoConfirmado && (torneo.estado === 'PUBLICADO' || torneo.estado === 'INSCRIPCIONES_CERRADAS');
}

// Un lugar que se libera pasa a la lista mientras el torneo se puede modificar. Con el sorteo
// confirmado, la lista termina.
export function seAsignanLugares(torneo: TorneoQueSeModifica & { tieneListaEspera: boolean }) {
  return torneo.tieneListaEspera && sePuedeModificar(torneo);
}

export const lugaresLibres = (cupo: number, ocupados: number) => Math.max(0, cupo - ocupados);

type EnEspera = { id: number; ordenListaEspera: number | null; creadoEn: Date };

// Por orden de llegada (02-dominio §11.1): el número que recibió al anotarse; con el mismo número,
// el que se anotó antes.
export const ordenDeLlegada = (a: EnEspera, b: EnEspera) =>
  (a.ordenListaEspera ?? Number.MAX_SAFE_INTEGER) - (b.ordenListaEspera ?? Number.MAX_SAFE_INTEGER) ||
  a.creadoEn.getTime() - b.creadoEn.getTime() ||
  a.id - b.id;

// Quiénes reciben los lugares libres: los primeros de la lista.
export function aQuienesLesToca<E extends EnEspera>(espera: E[], libres: number): E[] {
  return [...espera].sort(ordenDeLlegada).slice(0, Math.max(0, libres));
}

// Hasta cuándo es suyo el lugar: las horas del torneo desde el aviso (decisión 076).
export const venceLaReserva = (ahora: Date, horas: number) => new Date(ahora.getTime() + horas * 3_600_000);
