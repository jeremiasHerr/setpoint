import type { JugadorPadron } from '@setpoint/shared';
import { useEffect, useRef, useState } from 'react';
import { mensajeDelLink, urlDelLink, urlDeWhatsApp } from './linkPersonal';
import { useGenerarLink } from './usePadron';

type Props = {
  jugador: JugadorPadron;
  slug: string;
  organizacion: string;
  alEditar: () => void;
};

// El menú de cada fila del padrón: el link personal (decisión 050) y editar. Un borde de 1 px, sin
// sombra (design.md §2). El link se crea la primera vez que se abre el menú, así el mensaje que se
// ve es el que sale.
export function MenuJugador({ jugador, slug, organizacion, alEditar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const generar = useGenerarLink(slug);
  const contenedor = useRef<HTMLDivElement>(null);

  // El padrón tarda un momento en volver a pedirse: mientras, vale el que devolvió el pedido.
  const codigo = generar.data?.id === jugador.id ? generar.data.codigoLink : jugador.codigoLink;
  const url = codigo ? urlDelLink(codigo) : null;
  const mensaje = url ? mensajeDelLink(jugador, organizacion, url) : null;
  // Uno dado de baja no se inscribe: su link no anda.
  const conLink = jugador.activo;

  useEffect(() => {
    if (!abierto) return;
    const cerrarAfuera = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', cerrarAfuera);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('mousedown', cerrarAfuera);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto]);

  const abrir = () => {
    setAviso(null);
    setAbierto((a) => !a);
    if (!abierto && conLink && !jugador.codigoLink && !generar.isPending) generar.mutate(jugador.id);
  };

  const copiar = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setAviso('Link copiado');
    } catch {
      setAviso('No se pudo copiar. Copialo de arriba.');
    }
  };

  const generarNuevo = () =>
    generar.mutate(jugador.id, { onSuccess: () => setAviso('Listo: el link anterior dejó de andar') });

  return (
    <div ref={contenedor} className="relative flex justify-end">
      <button
        type="button"
        onClick={abrir}
        aria-label={`Opciones de ${jugador.nombre} ${jugador.apellido}`}
        aria-expanded={abierto}
        className="flex size-8 items-center justify-center rounded-lg text-gris-400 hover:bg-linea-suave hover:text-negro"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-[17px]" aria-hidden="true">
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {abierto && (
        <div className="absolute top-full right-0 z-10 mt-1 flex w-[330px] max-w-[calc(100vw-32px)] flex-col rounded-[12px] border border-linea bg-white text-left">
          {conLink && (
            <>
              <a
                href={mensaje ? urlDeWhatsApp(jugador.telefono, mensaje) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!mensaje}
                onClick={() => setAbierto(false)}
                className={`flex items-start gap-[11px] px-3.5 py-[11px] hover:bg-fondo ${mensaje ? '' : 'pointer-events-none opacity-40'}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden="true">
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
                </svg>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-sm font-medium">Compartir link por WhatsApp</span>
                  <span className="text-xs text-gris-500">
                    {jugador.telefono
                      ? `Abre el chat con ${jugador.nombre}, con el mensaje armado`
                      : 'Sin teléfono: elegís el contacto en WhatsApp'}
                  </span>
                </span>
              </a>
              <p className="mx-3.5 mb-3 ml-[42px] rounded-control bg-fondo px-[13px] py-[11px] text-[13px] leading-[1.45] break-words text-gris-700">
                {generar.isError && !codigo ? 'No pudimos crear el link. Cerrá el menú y probá de nuevo.' : (mensaje ?? 'Creando el link…')}
              </p>
              <button
                type="button"
                onClick={copiar}
                disabled={!url}
                className="border-t border-linea-suave px-3.5 py-[11px] text-left text-sm font-medium hover:bg-fondo disabled:opacity-40"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={generarNuevo}
                disabled={!codigo || generar.isPending}
                className="flex flex-col gap-[3px] border-t border-linea-suave px-3.5 py-[11px] text-left hover:bg-fondo disabled:opacity-40"
              >
                <span className="text-sm font-medium">Generar link nuevo</span>
                <span className="text-xs text-gris-500">El anterior deja de andar</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setAbierto(false);
              alEditar();
            }}
            className={`px-3.5 py-[11px] text-left text-sm font-medium hover:bg-fondo ${conLink ? 'border-t border-linea-suave' : ''}`}
          >
            Editar jugador
          </button>
          {aviso && (
            <p role="status" className="border-t border-linea-suave px-3.5 py-[11px] font-mono text-xs text-gris-500">
              {aviso}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
