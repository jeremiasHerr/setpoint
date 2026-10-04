const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// El campo vacío queda en 0 mientras se escribe; el schema lo rechaza al guardar.
export function aEntero(texto: string, maximo: number) {
  return Math.min(maximo, Number(texto.replace(/\D/g, '')) || 0);
}

// '2026-10-06' -> '6 oct'. Se arma desde el texto para que no se corra por zona horaria.
export function diaCorto(dia: string) {
  const [, mes, numero] = dia.split('-').map(Number);
  return `${numero} ${MESES[mes - 1]}`;
}

export function rangoDeDias(desde: string, hasta: string) {
  return `${diaCorto(desde)} al ${diaCorto(hasta)}`;
}
