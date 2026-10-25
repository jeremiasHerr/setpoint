// El comprobante que sale cuando se confirma el pago, nunca en la vuelta del checkout
// (05-pagos §4, docs/pantallas/email/comprobante.html).

const pesos = new Intl.NumberFormat('es-AR');
const fechaYHora = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires',
});

// "dom 25 oct · 18:42" (design.md §8).
export function fechaDelPago(fecha: Date) {
  const partes = Object.fromEntries(fechaYHora.formatToParts(fecha).map((p) => [p.type, p.value.replace('.', '')]));
  return `${partes.weekday} ${partes.day} ${partes.month} · ${partes.hour}:${partes.minute}`;
}

export type DatosComprobante = {
  inscripcionId: number;
  jugador: string;
  torneo: string;
  categoria: string;
  organizacion: string;
  monto: number;
  pagadoEn: Date;
  linkDelTorneo: string;
};

export function comprobante(datos: DatosComprobante) {
  return {
    asunto: `Estás inscripto en ${datos.torneo} · ${datos.categoria}`,
    texto: [
      `Hola ${datos.jugador.split(' ')[0]}, se confirmó tu pago. Guardá este email: es tu comprobante.`,
      '',
      `Jugador: ${datos.jugador}`,
      `Torneo: ${datos.torneo}`,
      `Categoría: ${datos.categoria}`,
      `Monto: $${pesos.format(datos.monto)}`,
      `Número de inscripción: ${datos.inscripcionId}`,
      `Fecha del pago: ${fechaDelPago(datos.pagadoEn)}`,
      '',
      `Ver el torneo: ${datos.linkDelTorneo}`,
      '',
      'En la app entrás con este mismo email y un código, sin contraseña: ahí anotás las fechas de tus partidos.',
      '',
      `Te llega este email porque te inscribiste en un torneo de ${datos.organizacion}.`,
    ].join('\n'),
  };
}
