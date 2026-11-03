# 064 — La fecha que carga la organización queda confirmada

**Estado:** aceptada — 3 de noviembre de 2026

## Contexto

F14 dice que **ningún jugador queda bloqueado por no tener cuenta: la organización siempre puede cargar la fecha en su nombre**. Lo que anota un jugador queda `anotada` hasta que el rival confirma ([04-flujo-jugador.md](../04-flujo-jugador.md) §6.3). Faltaba decidir en qué estado queda lo que carga la organización, y si esa carga tiene los mismos límites que la de un jugador.

## Opciones consideradas

1. **Queda `confirmada`.** La organización hace de registro, como hoy el grupo de WhatsApp.
   - En contra: no queda constancia de que cada jugador se enteró.
2. **Queda `anotada` y confirma cada jugador.**
   - En contra: el jugador sin cuenta nunca puede confirmar, que es justo el caso para el que existe la carga de la organización.

## Decisión

Opción 1.

- **Lo que carga la organización queda `confirmada`**, con ella como quien anotó y quien confirmó.
- **No gasta reprogramaciones ni pide antelación**: es una decisión del comité, no un pedido de un jugador.
- **Respeta el plazo**, como los jugadores. El plazo no se extiende ([decisión 062](062-acciones-del-tablero.md)), y una fecha después del último día ya figuraría vencida en el tablero ([decisión 060](060-partidos-vencidos-calculados.md)). Un partido vencido se resuelve con el resultado, no con una fecha nueva.
- **La fecha no puede haber pasado.**
- **Se les avisa a los dos jugadores** con cuenta, por push.
- La ruta es `PUT /api/organizaciones/:slug/torneos/:id/partidos/:partidoId/fecha`. Se carga desde el tablero, como anunciaba la decisión 062.

## Por qué

- **El reglamento ya delega en la organización** la resolución de lo que no se coordinó: una fecha que ella anota es una decisión suya, no una propuesta.
- **Es la única forma de que un jugador sin la app tenga su partido agendado.**

## Qué se resigna

- **La constancia de que cada jugador supo.** Si un jugador dice que no se enteró de una fecha que cargó la organización, el historial ([decisión 066](066-historial-de-coordinacion.md)) muestra que la cargó ella, no que él la vio.
