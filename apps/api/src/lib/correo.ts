import nodemailer from 'nodemailer';

// En desarrollo y en la entrega el servidor es Mailpit, un contenedor del docker-compose que
// atrapa los mails y los muestra en http://localhost:8025. No sale nada a internet.
// En la versión publicada los mails salen por la API HTTP de Resend, porque Railway bloquea
// el SMTP saliente en su plan Hobby (decisión 086).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 1025;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const REMITENTE = process.env.CORREO_REMITENTE ?? 'SetPoint <no-responder@setpoint.local>';

const transporte = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // El 465 es SMTP con TLS desde el arranque; Mailpit, en el 1025, no usa TLS.
      secure: SMTP_PORT === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

type Correo = {
  para: string;
  asunto: string;
  texto: string;
};

async function enviarPorResend(apiKey: string, { para, asunto, texto }: Correo) {
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: REMITENTE, to: [para], subject: asunto, text: texto }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!respuesta.ok) {
    throw new Error(`Resend respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

export async function enviarCorreo(correo: Correo) {
  if (RESEND_API_KEY) {
    await enviarPorResend(RESEND_API_KEY, correo);
    return;
  }
  // Sin SMTP configurado el mail se imprime: alcanza para probar sin levantar Mailpit.
  if (!transporte) {
    console.log(`[correo sin enviar] para: ${correo.para} · ${correo.asunto}\n${correo.texto}`);
    return;
  }
  await transporte.sendMail({ from: REMITENTE, to: correo.para, subject: correo.asunto, text: correo.texto });
}
