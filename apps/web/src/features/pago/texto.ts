import { diaCorto } from '../torneos/texto';

// Fechas de la pantalla de pago, en la hora de Argentina, como las anota la API.

const zona = 'America/Argentina/Buenos_Aires';
const dia = new Intl.DateTimeFormat('en-CA', { timeZone: zona });
const diaDeLaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: zona });
const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zona });

// Hasta cuándo es suyo el lugar que le tocó de la lista de espera: "sáb 20 sep · 18:40".
export function hastaCuando(iso: string) {
  const fecha = new Date(iso);
  return `${diaDeLaSemana.format(fecha).replace('.', '')} ${diaCorto(dia.format(fecha))} · ${hora.format(fecha)}`;
}
