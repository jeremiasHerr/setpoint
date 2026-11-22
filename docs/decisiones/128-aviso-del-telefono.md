# 128 — El jugador ve un aviso de que su rival ve su teléfono, y puede ocultarlo

**Estado:** aceptada — 22 de noviembre de 2026. Completa la [decisión 046](046-telefono-del-rival.md), que dejó el aviso pendiente.

## Contexto

[04-flujo-jugador.md](../04-flujo-jugador.md) §6.6 dice que los rivales pueden ver el teléfono del jugador "con aviso previo". La [decisión 046](046-telefono-del-rival.md) hizo que la API le dé el teléfono solo al rival de un partido que todavía no se jugó, para "Escribirle" por WhatsApp, y dejó el aviso para después: hasta ahora el jugador no se enteraba. Para POLENTA importa poco, porque todos se conocen del grupo; para un circuito con inscripción abierta, los rivales pueden ser desconocidos.

## Opciones consideradas

1. **Un aviso en la app que solo informa**, que se cierra con "Entendido" y queda guardado en el celular.
   - En contra: es un aviso, no una elección. Al cambiar de celular, vuelve a aparecer.
2. **Un aviso con la opción de ocultar el teléfono**, guardado en la cuenta.
   - En contra: una migración y un endpoint, y quien lo oculta hace que el rival tenga que coordinar por otro lado.
3. **El aviso en la inscripción web**, en la pantalla de pago.
   - En contra: no le llega a quien cargó la organización, que en POLENTA es todo el padrón, y no da a elegir.

## Decisión

Opción 2, elegida por el grupo.

- **`Usuario.muestraTelefonoARivales`**, `null` mientras no respondió. Es de la cuenta: vale en todos sus circuitos y en cualquier celular.
- **Mientras sea `null`, el teléfono se muestra, como antes.** Ocultarlo hasta que responda dejaría sin "Escribirle" a los rivales de quien todavía no abrió la app, que es casi todo el padrón al empezar un torneo.
- **El aviso va arriba de *Cuándo juego***, solo si la organización tiene su teléfono en el padrón y todavía no respondió: "Entendido" o "No mostrar mi teléfono".
- **Se cambia cuando quiera** desde *Circuitos*, la pantalla que abre el nombre del circuito, donde está "Cerrar sesión".
- **Oculto, al rival le aparece lo mismo que cuando no hay teléfono:** "No tenemos el teléfono de…, pedíselo a la organización". No se le dice que lo ocultó.
- **La organización lo sigue viendo** en el tablero y el padrón: es su padrón, y es quien resuelve lo que no se coordina.

## Por qué

- **Es lo que pide §6.6:** el jugador se entera antes de que importe, y elige.
- **No rompe la coordinación de nadie por defecto:** el teléfono sigue saliendo hasta que el jugador diga que no.
- **El lugar ya estaba previsto:** la 046 decía que el aviso era "un dato del jugador y un `if` en `partidosDelJugador()`", y la app ya tenía el caso sin teléfono.

## Qué se resigna

- **Hasta que abre la app, su teléfono se ve sin que lo haya aceptado**, como hasta ahora. Esperar su respuesta para mostrarlo dejaría sin forma de escribirse a los rivales de quien nunca abre la app.
- **Quien no tiene la app no ve el aviso**; la organización sigue siendo quien decide qué teléfono carga en su padrón.
