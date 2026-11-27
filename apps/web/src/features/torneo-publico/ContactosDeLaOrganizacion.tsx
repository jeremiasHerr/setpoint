import type { Contacto } from '@setpoint/shared';
import { urlDeWhatsApp } from '../padron/linkPersonal';

// Un link de red social se abre; un usuario ("@polenta") se muestra tal cual.
const esLink = (valor: string) => /^https?:\/\//i.test(valor);

// El WhatsApp abre el chat con el torneo ya escrito (decisión 091).
export function ContactosDeLaOrganizacion({ contactos, torneo }: { contactos: Contacto[]; torneo: string }) {
  if (contactos.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 rounded-tarjeta border border-linea p-4">
      <span className="text-[15px] text-pizarra-500">Contacto de la organización</span>
      <ul className="flex flex-col gap-2">
        {contactos.map((c) => (
          <li key={`${c.tipo}-${c.valor}`} className="flex flex-col gap-0.5">
            <span className="text-[12.5px] font-medium text-noche">{c.tipo === 'whatsapp' ? 'whatsapp' : 'red social'}</span>
            {c.tipo === 'whatsapp' ? (
              <a
                href={urlDeWhatsApp(c.valor, `Hola, te escribo por el torneo ${torneo}`)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[17px] font-semibold tabular-nums underline underline-offset-[3px]"
              >
                {c.valor}
              </a>
            ) : esLink(c.valor) ? (
              <a href={c.valor} target="_blank" rel="noreferrer" className="text-[17px] font-semibold break-words underline underline-offset-[3px]">
                {c.valor}
              </a>
            ) : (
              <span className="text-[17px] font-semibold break-words">{c.valor}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
