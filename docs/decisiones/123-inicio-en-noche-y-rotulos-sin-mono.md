# 123 — El Inicio en columnas noche, fondo blanco y rótulos sin mono

**Estado:** aceptada — 21 de noviembre de 2026. Reemplaza la [decisión 116](116-cemento-y-columnas-por-estado.md) (el fondo `cemento` y las columnas por color de estado) y toca la regla de los rótulos en mono de [design.md](../design.md).

## Contexto

Con el Inicio ya en cemento y con las columnas rellenas de amarillo, lona y azul, la devolución fue que sobraba relleno de color: cuatro fondos distintos competían entre sí y con las tarjetas, el cemento ensuciaba todas las pantallas del organizador, y los rótulos en Geist Mono gris de 11 a 13 px se leían flojos y daban un aire de código a lo que es texto.

Se armó una hoja de revisión con cinco direcciones, cada una a 1440 y a 375 px: [Inicio sin relleno](https://claude.ai/artifact/4BmoGAsXuaxRf1iEH5a3U1).

## Opciones consideradas

- **A. Filetes.** Fondo blanco y columnas abiertas separadas por una línea vertical. En contra: con una columna vacía queda mucho blanco, y el estado depende de un cuadrito de 9 px.
- **B. Hoja de torneos.** Una sola hoja enmarcada, con los torneos como filas y una barrita de color bajo cada título. En contra: rompe el patrón de tarjeta con borde del resto de la web.
- **C. Carriles con cinta.** Una cinta de 3 px de color arriba de cada columna y el título en Funnel Display. En contra: sigue habiendo color en el borde, lo más cercano al relleno que se quería sacar, y cuatro cintas pueden parecer un semáforo.
- **D1. Columnas noche con tarjetas blancas.** Recuadros redondeados en `noche` y las tarjetas en `papel` adentro.
- **D2. Columnas con borde noche.** Los mismos recuadros, con el contorno en noche de 2 px y el interior blanco. En contra: marco dentro de marco, con ruido de líneas.

## Decisión

**D1**, elegida por el usuario.

- **El fondo de las pantallas del organizador vuelve a ser blanco (`papel`).** Se sacan `cemento` y `linea-cemento`. La franja del torneo se separa con `linea`; las tarjetas ya llevan su borde `linea`.
- **Las columnas del Inicio son recuadros `noche` de radio 20,** con las tarjetas de los torneos en `papel` adentro. El título, la columna vacía y "Armar el próximo torneo" van en blanco, la ayuda en `pizarra-400` y el contador es una píldora `noche-2` con borde `borde-noche`.
- **El estado lo dice la marca del título,** en una versión clara de cada color para leerse sobre noche: `amarillo-claro` (#D9A441), `lona`, `azul-claro` (#6F97F0) y `pizarra-400` para Terminados. Los dos tokens nuevos están en `index.css` y en design.md. Los `*-fondo` y `*-borde` de estado no se borran: los usan otras pantallas.
- **El encabezado del circuito pierde el rótulo mono "tu circuito":** el nombre de la organización arranca la página.
- **Los rótulos chicos van en Instrument Sans 12,5 px, peso 500, `noche`, y Geist Mono queda solo para cifras** con `tabular-nums`. Es la regla que proponía la dirección C y que D1 hereda. Pasan a la regla los rótulos, los chips, las migas, los encabezados de tabla y el chip con el nombre de la convocatoria. Un metadato secundario de una fila (el detalle bajo un nombre, un motivo) va en `pizarra-500`, 13 px, peso 400, para no competir con el dato. Quedan en mono los montos, las fechas numéricas, los marcadores, los contadores y los códigos. La app móvil no cambia.

## Por qué

- El color queda en un solo lugar: la marca de 9 px de cada título. Lo demás es noche y blanco, que es el mismo par de la barra de arriba, así que la pantalla se lee en dos tonos.
- Las columnas siguen siendo recuadros con un solo trazo y mantienen las cuatro columnas por estado de la [094](094-inicio-en-columnas.md).
- Un rótulo en `noche` sobre papel da 17,41:1; el mismo en mono gris de 11 px era lo más débil de la pantalla. Y el mono pasa a querer decir "esto es una cifra".

## Qué se resigna

- Cuatro bloques oscuros pesan más que la barra y compiten con el botón principal, que deja de ser lo más oscuro de la pantalla.
- Las columnas vacías son masas noche con una línea de texto, y En preparación está vacía casi siempre.
- El modo oscuro, si algún día llega, no tiene qué invertir.
- Se pierde la regla de que el mono da el acabado de producto a los rótulos; el costo es que las tablas se leen menos "de planilla".
