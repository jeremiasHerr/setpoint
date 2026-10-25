import type { TorneoPublico } from '@setpoint/shared';

// 'AAAA-MM-DD' -> "viernes 26 de septiembre" (design.md §8, fecha larga). Se arma al mediodía
// para que la zona horaria no la corra de día.
const fechaLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
export function diaLargo(fecha: string) {
  return fechaLarga.format(new Date(`${fecha}T12:00:00`)).replace(',', '');
}

const pesos = new Intl.NumberFormat('es-AR');
export function importe(precio: number) {
  return `$${pesos.format(precio)}`;
}

// "8 zonas de 4 · dos cuadros"
export function formato(torneo: TorneoPublico) {
  const porZona = Math.ceil(torneo.cupo / torneo.cantidadGrupos);
  const zonas = torneo.cantidadGrupos === 1 ? '1 zona' : `${torneo.cantidadGrupos} zonas`;
  return `${zonas} de ${porZona} · ${torneo.tieneCuadroConsuelo ? 'dos cuadros' : 'un cuadro'}`;
}

export function lugaresLibres(torneo: TorneoPublico) {
  return Math.max(torneo.cupo - torneo.ocupados, 0);
}
