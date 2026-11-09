import type { ComoSeVinculo, JugadorPadron } from '@setpoint/shared';
import { COMO_SE_VINCULO } from '../revisiones/textos';

// Cómo se dicen las vinculaciones en el padrón (decisiones 051 y 083, design.md §8).

// La columna "cómo se vinculó" de Nuevas: corta, porque va en una lista.
export const COMO_EN_LA_LISTA: Record<ComoSeVinculo, string> = {
  link_personal: 'link personal',
  busqueda: 'buscándose',
  propuesta: '"¿Sos…?"',
  organizacion: 'la organización',
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Días de calendario entre la fecha y hoy, en la hora de quien mira.
export function diasDesde(fecha: string, hoy = new Date()) {
  const inicioDelDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((inicioDelDia(hoy) - inicioDelDia(new Date(fecha))) / MS_POR_DIA);
}

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// La columna "cuándo": "hoy", "ayer", "jue 18" en la última semana, y "18 sep" antes.
export function cuandoSeVinculo(fecha: string) {
  const dias = diasDesde(fecha);
  const d = new Date(fecha);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()}`;
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// El dato "Vinculado" del panel: "hoy, con el link personal".
export function vinculadoEl(jugador: Pick<JugadorPadron, 'vinculadoEn' | 'vinculadoPor'>) {
  const como = jugador.vinculadoPor ? COMO_SE_VINCULO[jugador.vinculadoPor] : null;
  if (!jugador.vinculadoEn) return como ?? 'sin datos';
  const cuando = cuandoSeVinculo(jugador.vinculadoEn);
  const dia = cuando === 'hoy' || cuando === 'ayer' ? cuando : `el ${cuando}`;
  return como ? `${dia}, ${como}` : dia;
}

// La última visita, para la nota de Nuevas: "hoy a las 19:20", "ayer", "el jueves 18".
export function laVisita(fecha: string) {
  const dias = diasDesde(fecha);
  const d = new Date(fecha);
  if (dias <= 0) return `hoy a las ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (dias === 1) return 'ayer';
  if (dias < 7) return `el ${DIAS[d.getDay()]} ${d.getDate()}`;
  return `el ${d.getDate()} ${MESES[d.getMonth()]}`;
}

// Nueva: vinculada después de la visita anterior. Sin visita anterior, todas lo son.
export function esVinculacionNueva(jugador: JugadorPadron, anterior: string | null) {
  if (!jugador.cuenta || !jugador.vinculadoEn) return false;
  return anterior === null || jugador.vinculadoEn > anterior;
}
