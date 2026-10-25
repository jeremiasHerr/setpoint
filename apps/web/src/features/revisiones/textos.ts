import type { ComoSeVinculo } from '@setpoint/shared';

// Cómo se dice cada cosa en Revisar vinculación (design.md §7 y §8).

export const COMO_SE_VINCULO: Record<ComoSeVinculo, string> = {
  link_personal: 'con el link personal',
  busqueda: 'buscándose',
  propuesta: 'con el "¿Sos…?"',
  organizacion: 'se lo pasó la organización',
};

const diaYHora = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// "jue 18 sep · 19:20"
export function diaYHoraCorta(fecha: string) {
  const p = Object.fromEntries(diaYHora.formatToParts(new Date(fecha)).map((x) => [x.type, x.value.replace('.', '')]));
  return `${p.weekday} ${p.day} ${p.month} · ${p.hour}:${p.minute}`;
}

// "jue 18 sep"
export function diaCorto(fecha: string) {
  return diaYHoraCorta(fecha).split(' · ')[0];
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// "desde oct 26", como en el padrón.
export function desde(fecha: string) {
  const d = new Date(fecha);
  return `desde ${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

export function motivoCorto(motivo: 'homonimo' | 'reclamo', nombre: string) {
  return motivo === 'homonimo' ? `hay otro ${nombre}` : 'otra cuenta dice que es suyo';
}
