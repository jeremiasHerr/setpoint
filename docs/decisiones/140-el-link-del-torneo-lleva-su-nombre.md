# 140 — El link del torneo lleva su nombre

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

El link que la organización comparte en el grupo para inscribirse era `setpoint.com.ar/c/jerepruebas/torneos/29`: el número es el id interno de la categoría, y nada dice que es una inscripción ni a qué torneo. Con la versión publicada cobrando de verdad, la idea es compartir Setpoint con circuitos reales cuanto antes, y el link es lo primero que ven los jugadores en WhatsApp.

## Opciones consideradas

1. **Sumarle el nombre y dejar el número:** `/c/jerepruebas/torneos/29-torneo-test-pago`, con el nombre decorativo.
   - En contra: el número sigue, y no dice que es una inscripción.
2. **Una dirección propia del torneo, sin número:** `/inscripcion/jerepruebas/torneo-test-pago`.
   - En contra: una columna nueva, los nombres repetidos, y qué pasa si se cambia el nombre. Y cuando cierra la inscripción, la misma dirección sigue abriendo la página del torneo.
3. **Un solo link para todo el torneo, con todas sus categorías:** `/inscripcion/polenta/primavera-26`, y la categoría se elige en la página.
   - En contra: una pantalla nueva para elegir la categoría, y cambia lo que se comparte, que hoy es un link por categoría.

## Decisión

Opción 2, elegida por el grupo.

- **El slug se arma al publicar**, con el nombre del torneo: `torneo-test-pago`. Si la convocatoria tiene varias categorías, cada una suma la suya: `primavera-2026-tercera`.
- **Queda fijo**, aunque después se cambie el nombre: hay links compartidos que no se pueden romper.
- **Es único dentro de la organización.** Si ya lo usa otro torneo, por ejemplo el del año anterior con el mismo nombre, lleva `-2`, `-3`… Si el nombre es solo números, empieza con `torneo-`, para no confundirse con un número de los links viejos.
- **Los links viejos siguen andando:** `/c/:slug/torneos/:id` abre el torneo y lleva al link nuevo, así quien lo copie de la barra copia el que tiene nombre.
- **Solo cambia el link que se comparte.** La inscripción, el pago, el en vivo y los cuadros siguen con el número en la dirección: a esas pantallas se llega desde la página del torneo, no desde el grupo.
- **Los torneos publicados antes** reciben su slug al arrancar la API, igual que los del seed.
- Lo copian el inicio, "Primeros pasos", el aviso de pocos inscriptos y la pantalla de torneo publicado; también va en el comprobante por email.

## Por qué

- **El link dice qué es y a qué torneo,** antes de abrirlo. Es lo que se lee en el grupo.
- **No rompe nada de lo que ya circula:** los links con número llevan al nuevo.
- **Un slug fijo es lo que hace confiable un link compartido.** Si cambiara con el nombre, un link viejo dejaría de andar.

## Qué se resigna

- **Si se cambia el nombre después de publicar, el link sigue con el nombre viejo.**
- **Cuando la inscripción cierra, la dirección sigue diciendo "inscripcion"** aunque la página muestre el torneo en juego.
- **El en vivo y los cuadros siguen con número.** Si hace falta, se hace lo mismo con ellos.
- **Un link por categoría**, como antes. Un link único para todo el torneo queda para después.
