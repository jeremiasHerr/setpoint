# La pintura del hero

La pintura del club de la landing no es una imagen dibujada aparte: es **código**. Cada archivo de esta carpeta la pinta en un canvas de 2400 × 2400, por capas y con pinceles propios (gouache, rayado de lápiz, textura de papel), y es determinista: misma semilla, misma pintura.

| Archivo | Qué es |
|---|---|
| `cancha-noche.html` | **La que usa la web.** El club de noche, con el cielo en azul pizarra, más claro que la página, para que el marco se despegue ([decisión 145](../decisiones/145-la-pintura-se-despega-de-la-pagina.md)) |
| `cancha-noche-v10.html` | La original de la [decisión 105](../decisiones/105-sistema-visual-ultima-luz.md), con el cielo del color de la página. Queda como referencia |
| `servidor.js` | Sirve esta carpeta y guarda lo que exporta la pintura |
| `derivados.js` | Arma, a partir de la pintura exportada, las cuatro imágenes de la web |

## Cómo se exporta

Sin Chrome headless: la pintura se abre en un navegador común.

1. Desde la raíz del repo, `node docs/pintura/servidor.js`. Queda escuchando en `http://127.0.0.1:8771`.
2. Abrir `http://127.0.0.1:8771/cancha-noche.html` y esperar a que termine de pintar (unos segundos).
3. En la consola del navegador, `exportar()`. Guarda `cancha-noche-2400.jpg` en esta carpeta, en JPEG 0,86. Git lo ignora.
4. Cortar el servidor y correr `node docs/pintura/derivados.js`. Deja en `apps/web/public` la pintura entera, la de 1800, el recorte del celular (la columna central de 960 × 2400) y la vista previa de WhatsApp (1200 × 630).

Si se cambia la pintura, hay que cambiarles el nombre a las imágenes y actualizar `Hero.tsx`: los navegadores y Cloudflare las guardan, y con el mismo nombre seguirían mostrando la vieja.

## Dónde se usa

En el hero, la pintura va anclada abajo, en un marco más ancho que alto: lo de arriba se recorta, y el titular blanco va sobre el cielo. Por eso el centro del cielo, detrás del titular, es tranquilo y con poco detalle. En el celular se ve solo la columna central.
