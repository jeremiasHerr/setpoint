import type { JugadorPadron } from '@setpoint/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Boton } from '../../components/Boton';
import { mensajeDelLink, urlDelLink, urlDeWhatsApp } from '../padron/linkPersonal';

type Props = {
  organizacion: string;
  // El perfil con el link nuevo, cuando llega.
  jugador: JugadorPadron | undefined;
  fallo: boolean;
};

// "Desvincular y compartir el link": el perfil quedó libre, y se le manda al dueño su link personal.
// Se genera uno nuevo: si el anterior lo tenía quien no era, deja de andar (decisión 050).
export function LinkDespuesDeDesvincular({ organizacion, jugador, fallo }: Props) {
  const [copiado, setCopiado] = useState(false);
  const url = jugador?.codigoLink ? urlDelLink(jugador.codigoLink) : null;
  const mensaje = jugador && url ? mensajeDelLink(jugador, organizacion, url) : null;

  return (
    <section className="flex flex-col gap-4 rounded-[16px] border-2 border-negro px-6 py-[22px]">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">El perfil quedó libre</h2>
        <p className="text-[15px] leading-normal text-gris-500">
          Mandale el link personal al dueño. Generamos uno nuevo: el anterior ya no anda.
        </p>
      </div>
      <p className="rounded-control bg-fondo px-[13px] py-[11px] text-sm leading-[1.45] break-words text-gris-700">
        {fallo ? 'No pudimos crear el link. Generalo desde el menú del jugador en el padrón.' : (mensaje ?? 'Creando el link…')}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {mensaje && jugador && (
          <a
            href={urlDeWhatsApp(jugador.telefono, mensaje)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-control bg-negro px-4 text-[15px] font-medium text-white"
          >
            Compartir por WhatsApp
          </a>
        )}
        <Boton
          disabled={!url}
          onClick={() => {
            if (!url) return;
            navigator.clipboard.writeText(url).then(
              () => setCopiado(true),
              () => setCopiado(false),
            );
          }}
        >
          {copiado ? 'Link copiado' : 'Copiar link'}
        </Boton>
        <Link to="/padron" className="inline-flex h-10 items-center px-2 text-[15px] font-medium text-gris-500 underline underline-offset-[3px]">
          Volver al padrón
        </Link>
      </div>
    </section>
  );
}
