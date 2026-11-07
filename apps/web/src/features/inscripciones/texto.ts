import type { MedioPago } from '@setpoint/shared';

// Textos de la pantalla Inscripciones que comparten varias tablas.

const pesos = new Intl.NumberFormat('es-AR');

// "$45.000"
export const plata = (monto: number) => `$${pesos.format(monto)}`;

export const nombreDelMedio: Record<MedioPago, string> = {
  mercadopago: 'MercadoPago',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

// Para buscar "perez" y encontrar a Pérez.
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

const zona = 'America/Argentina/Buenos_Aires';
const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zona });
const dia = new Intl.DateTimeFormat('en-CA', { timeZone: zona });
const diaDeLaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: zona });

const UNA_HORA = 60 * 60 * 1000;

// Cuándo vence una reserva. Las de 15 minutos van en rojo, con la hora: es lo que decide si se
// espera o se llama al siguiente. La de 24 horas de quien venía de la lista de espera, en gris
// hasta su última hora: "mañana 18:40" (decisión 076).
export function cuandoVence(reservaVence: string, ahora = new Date()) {
  const vence = new Date(reservaVence);
  const falta = vence.getTime() - ahora.getTime();
  if (falta <= 0) return { texto: `venció ${hora.format(vence)}`, urgente: true };
  if (falta < UNA_HORA) return { texto: `vence ${hora.format(vence)}`, urgente: true };

  const manana = new Date(ahora.getTime() + 24 * UNA_HORA);
  const cuando =
    dia.format(vence) === dia.format(ahora)
      ? 'hoy'
      : dia.format(vence) === dia.format(manana)
        ? 'mañana'
        : diaDeLaSemana.format(vence).replace('.', '');
  return { texto: `${cuando} ${hora.format(vence)}`, urgente: false };
}
