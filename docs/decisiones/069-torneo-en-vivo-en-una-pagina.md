# 069 — El torneo en vivo es una sola página, con pestañas Zonas, Cuadros y Calendario

**Estado:** aceptada — 4 de noviembre de 2026

## Contexto

F10 pide que cualquiera siga el torneo desde un enlace, sin cuenta: las tablas de zona, los cuadros y el calendario de partidos. En la verificación del 50% F10 quedó en 0%: solo existía la página de los cuadros (`/c/:slug/torneos/:id/cuadros`), y las tablas de zona solo las veía quien administra ([decisión 019](019-acceso-a-las-posiciones.md)). No hay pantalla de referencia para las zonas ni para el calendario.

## Opciones consideradas

1. **Una página con pestañas**, `/c/:slug/torneos/:id/en-vivo`: Zonas, Cuadros y Calendario. `/cuadros` abre la misma página en la pestaña Cuadros.
   - En contra: la página de los cuadros deja de ser una pantalla aparte, y su encabezado cambia.
2. **Dos páginas nuevas**, `/zonas` y `/calendario`, con enlaces cruzados con `/cuadros`.
   - En contra: la organización tiene tres enlaces para compartir, y quien entra por uno no sabe que están los otros.
3. **Dentro de la convocatoria** (`/c/:slug/torneos/:id`): la página del torneo deja de mostrar la inscripción al empezar y pasa a mostrar las zonas y el calendario.
   - En contra: mezcla dos momentos en una página, que depende del estado del torneo para saber qué mostrar.

## Decisión

Opción 1, elegida por el grupo.

- **Un solo enlace para compartir**, `/c/:slug/torneos/:id/en-vivo`. La pestaña se guarda en `?ver=zonas|cuadros|calendario`, así se puede compartir una en particular. Sin pestaña, abre en las zonas mientras se juegan y en los cuadros después.
- **`/cuadros` sigue andando** y abre la pestaña Cuadros: los enlaces que ya se compartieron no se rompen.
- **La API suma `GET /api/publico/:slug/torneos/:id/en-vivo`**, con las tablas de zona (de la misma cuenta que las posiciones de la organización, como anunciaba la decisión 019), los partidos de cada zona y el calendario. Los cuadros siguen en su ruta. Ningún jugador va con teléfono ni email.
- **Las zonas se publican al confirmar el sorteo.** Antes son un borrador de la organización ([decisión 014](014-borrador-del-sorteo.md)), y la API responde `ZONAS_NO_GENERADAS`.
- **El calendario lista los partidos con fecha**, por día y en la hora de Argentina, desde hoy. Los días que ya pasaron quedan abajo, con sus resultados. Una fecha anotada que el rival no confirmó dice "a confirmar". Lo que no tiene fecha se cuenta, sin listarlo.
- **Las zonas se siguen mostrando con los cuadros armados**: dicen cómo llegó cada uno.
- **Entradas:** el tablero cambia "Ver cuadros" por "Ver la página pública", también en la fase de grupos, y la convocatoria cerrada suma "Ver el torneo en vivo".

## Por qué

- **F10 es "la pantalla que la organización comparte en su grupo"**: un enlace, no tres.
- **Reutiliza todo lo que ya existe:** la cuenta de las posiciones, los componentes de los cuadros y los textos del tablero ("Pérez y Gómez están clasificando a Campeonato").
- **Una ruta pública nueva, aparte de la de la organización**, como dice la decisión 019: se ve en la URL qué no pide login, y no se toca ningún permiso.

## Qué se resigna

- **La página de los cuadros pierde su título propio** ("Los dos cuadros"): ahora es "El torneo en vivo", con los cuadros en una pestaña.
- **Las tablas públicas no tienen la matriz de resultados del tablero**: en el celular no entra, y los partidos de la zona se listan debajo de la tabla.
