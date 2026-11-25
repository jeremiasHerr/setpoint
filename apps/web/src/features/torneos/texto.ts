const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// El campo vacío queda en 0 mientras se escribe; el schema lo rechaza al guardar.
export function aEntero(texto: string, maximo: number) {
  return Math.min(maximo, Number(texto.replace(/\D/g, '')) || 0);
}

// 'AAAA-MM-DD' de hoy, en la hora de quien mira.
export const hoy = () => new Intl.DateTimeFormat('en-CA').format(new Date());

// '2026-10-06' -> '6 oct'. Se arma desde el texto para que no se corra por zona horaria.
export function diaCorto(dia: string) {
  const [, mes, numero] = dia.split('-').map(Number);
  return `${numero} ${MESES[mes - 1]}`;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// '2026-10-23' -> 'viernes 23'. En UTC, para que el día de la semana no se corra por zona horaria.
export function diaConSemana(dia: string) {
  const [anio, mes, numero] = dia.split('-').map(Number);
  return `${DIAS[new Date(Date.UTC(anio, mes - 1, numero)).getUTCDay()]} ${numero}`;
}

// '2026-11-13' -> 'vie 13': la fecha corta de design.md §8.
export function diaConSemanaCorto(dia: string) {
  return diaConSemana(dia).replace(/^\S+/, (nombre) => nombre.slice(0, 3));
}

export function rangoDeDias(desde: string, hasta: string) {
  return `${diaCorto(desde)} al ${diaCorto(hasta)}`;
}
