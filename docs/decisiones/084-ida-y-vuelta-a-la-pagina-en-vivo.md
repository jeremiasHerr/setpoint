# 084 — Ida y vuelta entre el tablero y la página en vivo

**Estado:** aceptada — 10 de noviembre de 2026

## Contexto

El tablero lleva a *El torneo en vivo* con "Ver la página pública" ([decisión 069](069-torneo-en-vivo-en-una-pagina.md)), en la misma pestaña. Las páginas públicas no tienen menú ni sesión: arriba solo está la marca de la organización. Al recorrer la demo como organizador, desde la página en vivo no había forma de volver al tablero, salvo con el botón del navegador.

Además, ninguna pantalla del organizador daba el enlace para compartir. F10 es "la pantalla que la organización comparte en su grupo", y para tener el enlace había que abrir la página y copiar la dirección.

## Opciones consideradas

1. **Abrir la página en otra pestaña, sumar "Copiar link" en el tablero, y "← El torneo" en la página en vivo**, hacia la página pública del torneo.
   - En contra: toca dos pantallas.
2. **Que la página pública reconozca la sesión del organizador** de ese circuito y le muestre "← Volver al tablero".
   - En contra: la página que comparte se le ve distinta que a los jugadores, y mezcla el panel con lo público.
3. **Un menú en el encabezado de las páginas públicas.**
   - En contra: no hay a dónde ir más allá del ranking. Haría falta una página pública del circuito, que es otra pantalla.

## Decisión

Opción 1.

- **"Ver la página pública" la abre en otra pestaña.** El organizador vuelve al tablero cerrándola, y lo que ve es lo mismo que ven los jugadores.
- **"Copiar link" al lado**, con el enlace de `/c/:slug/torneos/:id/en-vivo`. Es el mismo botón que usan las tarjetas del inicio para el link de la inscripción y el del ranking.
- **"← El torneo" arriba del título** de la página en vivo, hacia `/c/:slug/torneos/:id`, que ya tiene "Ver el torneo en vivo". Es una vuelta que sirve para cualquiera que abra la página, con sesión o sin ella.

## Por qué

- **Lo público es igual para todos:** la página no depende de quién la mira.
- **El enlace para compartir está donde se sigue el torneo**, sin abrir la página para copiar la dirección.
- **Sin pantallas nuevas:** "← El torneo" lleva a una página que ya existe y que enlaza de vuelta.

## Qué se resigna

- **Quien llega desde el grupo y toca "← El torneo" ve la convocatoria**, que con el torneo en juego solo dice que la inscripción cerró y enlaza otra vez a la página en vivo.
- **La tarjeta "En juego" del inicio no tiene "Copiar link"**: el enlace se copia desde el tablero.
