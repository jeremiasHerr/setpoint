import { fechaDelPago } from '../pagos/comprobante';

// Los emails de las solicitudes de un torneo con aprobación (decisión 054) y de la lista de espera (F13).

type Datos = { nombre: string; torneo: string; organizacion: string };

function saludo(nombre: string) {
  return nombre ? `Hola ${nombre.split(' ')[0]}` : 'Hola';
}

export function solicitudAprobada(datos: Datos & { minutos: number; link: string }) {
  return {
    asunto: `${datos.organizacion} aprobó tu solicitud para ${datos.torneo}`,
    texto: [
      `${saludo(datos.nombre)}, ${datos.organizacion} aprobó tu solicitud. Pagá la inscripción para confirmar tu lugar:`,
      '',
      datos.link,
      '',
      `Te guardamos el lugar ${datos.minutos} minutos desde que abrís el link. Si no llegás, podés volver a abrirlo mientras la inscripción siga abierta y queden lugares.`,
      '',
      `Te llega este email porque pediste inscribirte en un torneo de ${datos.organizacion}.`,
    ].join('\n'),
  };
}

// Sin explicación: la organización no está obligada a darla (02-dominio §2).
export function solicitudNoAprobada(datos: Datos) {
  return {
    asunto: `Tu solicitud para ${datos.torneo}`,
    texto: [
      `${saludo(datos.nombre)}, ${datos.organizacion} no aprobó tu solicitud para ${datos.torneo}. No se te cobró nada.`,
      '',
      `Te llega este email porque pediste inscribirte en un torneo de ${datos.organizacion}.`,
    ].join('\n'),
  };
}

type DatosDelLugar = Datos & { precio: number; vence: Date; link: string };

const pesos = new Intl.NumberFormat('es-AR');

// Al primero de la lista de espera, cuando se libera un lugar: ya es suyo hasta el vencimiento
// (decisión 076, docs/pantallas/email/lugar-liberado.html).
export function lugarLiberado(datos: DatosDelLugar) {
  return {
    asunto: `Se liberó un lugar para vos en ${datos.torneo}`,
    texto: [
      `${saludo(datos.nombre)}, eras el primero de la lista de espera. El lugar ya está guardado a tu nombre: para quedarte con él, pagá la inscripción ($${pesos.format(datos.precio)}) antes del ${fechaDelPago(datos.vence)}.`,
      '',
      datos.link,
      '',
      'Si no pagás a tiempo, el lugar pasa al siguiente de la lista y no se te cobra nada.',
      '',
      `Te llega este email porque te anotaste en la lista de espera de un torneo de ${datos.organizacion}.`,
    ].join('\n'),
  };
}

// "Recordarle", desde Inscripciones: el mismo email, para una reserva que todavía no se pagó.
export function recordatorioDePago(datos: DatosDelLugar) {
  return {
    asunto: `Te falta pagar tu lugar en ${datos.torneo}`,
    texto: [
      `${saludo(datos.nombre)}, ${datos.organizacion} te recuerda que tenés un lugar reservado. Para quedarte con él, pagá la inscripción ($${pesos.format(datos.precio)}) antes del ${fechaDelPago(datos.vence)}.`,
      '',
      datos.link,
      '',
      'Si no pagás a tiempo, el lugar se libera y no se te cobra nada.',
      '',
      `Te llega este email porque reservaste un lugar en un torneo de ${datos.organizacion}.`,
    ].join('\n'),
  };
}
