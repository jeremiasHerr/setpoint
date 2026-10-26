// Los emails de las solicitudes de un torneo con aprobación (decisión 054).

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
