// Separa en mensajes lo que pega la organización, como lo copia WhatsApp. Lógica pura.
//
// Al copiar varios mensajes, cada uno empieza con la fecha, la hora y quién lo mandó:
//   [20/11/26, 18:03:12] Diego Antileo: perdí 46 36        (iPhone, o la exportación)
//   20/11/26 18:03 - Diego Antileo: perdí 46 36             (Android, exportación)
//   [18:03, 20/11/2026] Diego Antileo: perdí 46 36          (WhatsApp Web y de escritorio)
// Una línea sin encabezado sigue el mensaje anterior. Si el texto no tiene ningún encabezado, cada
// línea es un mensaje sin remitente.

export type MensajeDelChat = { numero: number; hora: string | null; remitente: string | null; texto: string };

const FECHA = String.raw`\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}`;
const HORA = String.raw`\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s?m\.?)?`;
// WhatsApp mete marcas invisibles de dirección de texto al principio de algunas líneas.
const INVISIBLES = /[‎‏‪-‮﻿]/g;

const ENCABEZADOS = [
  new RegExp(String.raw`^\[?(${FECHA}),?\s+(${HORA})\]?\s*(?:-\s*)?([^:]{1,60}?):\s?(.*)$`, 'i'),
  new RegExp(String.raw`^\[(${HORA}),\s*(${FECHA})\]\s*([^:]{1,60}?):\s?(.*)$`, 'i'),
];

function encabezado(linea: string) {
  const [primero, segundo] = ENCABEZADOS;
  const a = primero.exec(linea);
  if (a) return { hora: a[2], remitente: a[3].trim(), texto: a[4] };
  const b = segundo.exec(linea);
  if (b) return { hora: b[1], remitente: b[3].trim(), texto: b[4] };
  return null;
}

// "18:03:12" se muestra "18:03".
const sinSegundos = (hora: string) => hora.replace(/^(\d{1,2}:\d{2}):\d{2}/, '$1');

export function leerChat(texto: string): MensajeDelChat[] {
  const lineas = texto.replace(INVISIBLES, '').split(/\r?\n/).map((l) => l.trim());
  const conEncabezado = lineas.some((l) => encabezado(l) !== null);
  const mensajes: Omit<MensajeDelChat, 'numero'>[] = [];

  for (const linea of lineas) {
    if (linea === '') continue;
    const e = conEncabezado ? encabezado(linea) : null;
    if (e) mensajes.push({ hora: sinSegundos(e.hora), remitente: e.remitente, texto: e.texto.trim() });
    else if (conEncabezado && mensajes.length > 0) mensajes[mensajes.length - 1].texto += `\n${linea}`;
    else mensajes.push({ hora: null, remitente: null, texto: linea });
  }

  return mensajes.filter((m) => m.texto !== '').map((m, i) => ({ numero: i + 1, ...m }));
}
