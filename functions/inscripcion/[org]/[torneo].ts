import type { TorneoPublico } from '@setpoint/shared';
import { vistaPreviaDelTorneo } from '../../../apps/web/src/features/torneo-publico/vistaPrevia';

// Función de Cloudflare Pages para el link del torneo, /inscripcion/:org/:torneo (decisión 144).
// WhatsApp arma la vista previa leyendo el HTML sin ejecutar la página, y la web se arma en el
// navegador: sin esto, todos los links muestran lo mismo. Pide el torneo a la API y le pone al HTML
// el título, la descripción y la imagen. Para quien abre el link no cambia nada.
//
// Solo corre en la versión publicada: con docker compose, nginx sirve la web y la vista previa es la
// genérica de index.html. Si la API no responde, devuelve la página igual, con la genérica.

// Del runtime de Cloudflare: esta carpeta no tiene sus tipos instalados.
type ElementoHtml = {
  remove(): void;
  setInnerContent(contenido: string): void;
  append(contenido: string, opciones: { html: boolean }): void;
};
declare class HTMLRewriter {
  on(selector: string, manejador: { element(elemento: ElementoHtml): void }): HTMLRewriter;
  transform(respuesta: Response): Response;
}

type Contexto = {
  request: Request;
  params: Record<string, string | string[]>;
  // Las variables del proyecto en Cloudflare llegan también a las funciones: es la misma dirección
  // de la API que usa la web al compilarse.
  env: { VITE_API_URL?: string };
  next(): Promise<Response>;
};

const API_POR_DEFECTO = 'https://api.setpoint.com.ar';

// El nombre del torneo y el de la organización los escribe cada organización: van escapados.
function escapar(texto: string) {
  return texto.replace(/[&<>"']/g, (caracter) => `&#${caracter.charCodeAt(0)};`);
}

async function torneoDeLaApi(contexto: Contexto): Promise<TorneoPublico | null> {
  const org = encodeURIComponent(String(contexto.params.org));
  const torneo = encodeURIComponent(String(contexto.params.torneo));
  try {
    const respuesta = await fetch(`${contexto.env.VITE_API_URL || API_POR_DEFECTO}/api/publico/${org}/torneos/${torneo}`);
    return respuesta.ok ? ((await respuesta.json()) as TorneoPublico) : null;
  } catch {
    return null;
  }
}

export async function onRequestGet(contexto: Contexto) {
  // La página de siempre: el index.html de la web, que la arma en el navegador.
  const pagina = await contexto.next();
  if (!pagina.headers.get('content-type')?.includes('text/html')) return pagina;

  const torneo = await torneoDeLaApi(contexto);
  if (!torneo) return pagina;

  const { titulo, descripcion } = vistaPreviaDelTorneo(torneo);
  const url = new URL(contexto.request.url);
  const propiedades: [string, string][] = [
    ['og:title', titulo],
    ['og:description', descripcion],
    ['og:type', 'website'],
    ['og:url', `${url.origin}${url.pathname}`],
    ['og:site_name', 'Setpoint'],
    ['og:locale', 'es_AR'],
    ['og:image', `${url.origin}/vista-previa.jpg`],
    ['og:image:type', 'image/jpeg'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
  ];
  const etiquetas = [
    ...propiedades.map(([propiedad, valor]) => `<meta property="${propiedad}" content="${escapar(valor)}" />`),
    `<meta name="description" content="${escapar(descripcion)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('');

  return (
    new HTMLRewriter()
      // setInnerContent escapa el texto: el título no necesita escaparse a mano.
      .on('title', { element: (elemento) => elemento.setInnerContent(`${titulo} · Setpoint`) })
      // Las genéricas de index.html se reemplazan, para que no queden dos.
      .on('meta[property^="og:"], meta[name="description"], meta[name^="twitter:"]', { element: (elemento) => elemento.remove() })
      .on('head', { element: (elemento) => elemento.append(etiquetas, { html: true }) })
      .transform(pagina)
  );
}
