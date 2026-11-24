# 144 — La vista previa del link del torneo

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

Al pegar el link del torneo en WhatsApp ([decisión 140](140-el-link-del-torneo-lleva-su-nombre.md)), la vista previa mostraba siempre lo mismo: "Setpoint", sin imagen. WhatsApp la arma leyendo el HTML del link sin ejecutar la página, y la web se arma en el navegador: el HTML que recibe es el `index.html` de siempre. La vista previa se ve más que la dirección, y es lo que decide si alguien del grupo abre el link.

## Opciones consideradas

1. **Una función de Cloudflare Pages en la dirección del link**, que le pide el torneo a la API y le pone al HTML el título, la descripción y la imagen.
   - En contra: código que solo existe en la versión publicada (con `docker compose up` la vista previa queda genérica), una consulta más a la API en cada visita a ese link, y cada visita cuenta en el cupo gratis de Cloudflare. La [decisión 086](086-version-publicada.md) había evitado escribir funciones de Cloudflare.
2. **Una vista previa genérica, pero buena,** en el `index.html` de siempre.
   - En contra: no dice qué torneo es.
3. **Que el link pase por la API,** que arma la vista previa y redirige a la web.
   - En contra: el link sería de `api.setpoint.com.ar`, lo contrario de la decisión 140.

## Decisión

Opción 1, elegida por el grupo, con la 2 de base para el resto de las páginas.

- **`functions/inscripcion/[org]/[torneo].ts`**, en la raíz del repo, que es donde Cloudflare busca las funciones. Corre solo en `/inscripcion/:org/:torneo`: el resto de la web se sirve como siempre.
- **Pide el torneo a la API pública** (`VITE_API_URL`, la misma variable de la web) y reemplaza en el HTML el título y las etiquetas de la vista previa: "Primavera 26 · Tercera" y "Inscripción abierta hasta el martes 24 de noviembre. Cuesta $45.000. Organiza Polenta Team Tenis.".
- **Qué dice lo arma `vistaPreviaDelTorneo`**, en la web, con las mismas funciones de fecha e importe que la página del torneo.
- **La imagen es una sola, de la marca:** la franja de arriba de la pintura del hero, a 1200 × 630 (`vista-previa.jpg`). La arma `docs/pintura/derivados.js`. Una imagen por torneo, con su nombre dibujado, queda para después.
- **Si la API no responde o el torneo no existe,** devuelve la página igual, con la vista previa genérica: nunca la rompe.
- **El nombre del torneo y el de la organización van escapados,** porque los escribe cada organización.
- **El `index.html` suma la imagen y la descripción** a la vista previa genérica, para el resto de las páginas.

## Por qué

- **Es la única que muestra el torneo** sin cambiar el link.
- **No toca la web ni la API:** la función es un archivo, y quien abre el link ve la misma página.
- **Las mismas funciones de formato** hacen que la vista previa diga las fechas y los importes igual que la página.

## Qué se resigna

- **Con `docker compose up`, la vista previa es la genérica:** la función solo corre en Cloudflare. Se prueba en local con `wrangler pages dev`.
- **Cada visita al link del torneo hace una consulta más a la API** y cuenta en el cupo gratis de funciones de Cloudflare (100.000 pedidos por día).
- **WhatsApp guarda la vista previa un tiempo:** si se cambia el torneo después de compartir el link, el grupo puede seguir viendo la vieja.
- **El link viejo, con número, tiene la vista previa genérica:** la función solo corre en el nuevo.
