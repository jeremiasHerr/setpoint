# 068 — La fecha se confirma en Cuándo juego

**Estado:** aceptada — 3 de noviembre de 2026

## Contexto

Cuando un jugador anota la fecha, el rival recibe un aviso y **confirma con un toque** ([04-flujo-jugador.md](../04-flujo-jugador.md) §6.2). La API ya lo resuelve (`POST .../confirmacion`), pero la confirmación no tiene pantalla de referencia: *Anotar la fecha* es la pantalla de quien anota, y *Cuándo juego* no dibuja el estado de una fecha que espera confirmación.

## Opciones consideradas

1. **En *Cuándo juego*, arriba de todo:** "Te falta confirmar", con una tarjeta por partido. "Confirmar" en lima, y "No puedo ese día" abre *Anotar la fecha* para proponer otra.
   - En contra: suma una sección a una pantalla que ya tiene tres.
2. **Una pantalla aparte de confirmación**, a la que se llega desde el aviso.
   - En contra: una ruta más, y abrirla desde el aviso pide enlaces profundos. Sin el aviso (sin cuenta de Firebase o con los avisos apagados), habría que llegar igual desde *Cuándo juego*.

## Decisión

Opción 1.

- **"Te falta confirmar" va primero**, antes del próximo partido: es lo único de la pantalla que le pide una acción, y de eso depende quién da W.O. si no se juega.
- **Una fecha sin confirmar no es el próximo partido.** La tarjeta negra muestra solo turnos pactados, o la fecha que anotó él mismo, con "Falta que Pablo confirme" debajo.
- **"No puedo ese día"** abre *Anotar la fecha*. Cambiar una fecha sin confirmar no gasta la reprogramación ([decisión 065](065-cambiar-una-fecha-sin-confirmar.md)).
- **La tarjeta del próximo partido** ofrece "Cambiar la fecha" o "Reprogramar" cuando se puede.
- La franja de arriba de la tarjeta es lima, no roja: no vence nada, falta un toque.

## Por qué

- **El aviso ya abre la app en *Cuándo juego*.** El toque que pide 04 §6.3 queda a un toque de abrir el aviso, sin pantallas nuevas.
- **Funciona sin avisos:** quien no los recibe ve lo mismo al abrir la app.

## Qué se resigna

- **La confirmación no tiene diseño propio.** Está armada con las piezas de *Cuándo juego*; si después hay una referencia, se reemplaza.
