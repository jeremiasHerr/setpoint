import nodemailer from 'nodemailer';

// En desarrollo y en la demo el servidor es Mailpit, un contenedor del docker-compose que
// atrapa los mails y los muestra en http://localhost:8025. No sale nada a internet.
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 1025;
const REMITENTE = process.env.CORREO_REMITENTE ?? 'SetPoint <no-responder@setpoint.local>';

const transporte = SMTP_HOST ? nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: false }) : null;

type Correo = {
  para: string;
  asunto: string;
  texto: string;
};

export async function enviarCorreo({ para, asunto, texto }: Correo) {
  // Sin SMTP configurado el mail se imprime: alcanza para probar sin levantar Mailpit.
  if (!transporte) {
    console.log(`[correo sin enviar] para: ${para} · ${asunto}\n${texto}`);
    return;
  }
  await transporte.sendMail({ from: REMITENTE, to: para, subject: asunto, text: texto });
}
