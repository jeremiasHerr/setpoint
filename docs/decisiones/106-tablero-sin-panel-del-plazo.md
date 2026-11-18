# 106 — El tablero sin el panel del plazo

**Estado:** aceptada — 18 de noviembre de 2026.

## Contexto

El tablero tenía, al lado de la tarjeta de las barras, un panel noche con los días que quedan del plazo ("Te quedan 3 días"), cuántos partidos faltan y cuántos se jugaron. El artifact *Última luz v2*, que dibuja el tablero con el sistema de la [decisión 105](105-sistema-visual-ultima-luz.md), no lo tiene: las barras van a todo el ancho y la cuenta de jugados va en el encabezado de su tarjeta.

Con menos de ocho zonas se notaba el problema. Las barras ocupaban un tercio de su tarjeta, y el panel, más alto, la estiraba y dejaba un hueco debajo. Además, el plazo se decía dos veces: en la bajada del título ("terminan el sábado 21") y en el panel.

## Opciones consideradas

1. **Como el artifact:** sin panel, la tarjeta de las barras a todo el ancho, con "21 / 24" en mono grande en su encabezado.
   - En contra: se pierde el número grande de días. El plazo queda en la bajada y en cada fila de *Lo que falta*.
2. **Mantener el panel**, con el radio de la tarjeta noche, y repartir las zonas a todo el ancho de la tarjeta.
   - En contra: el plazo sigue repetido, y con pocas zonas las barras quedan muy anchas o lejos de su cuenta.

## Decisión

Opción 1, elegida por el grupo.

- **La tarjeta de las barras va a todo el ancho.** En su encabezado, el título ("Los 24 partidos, zona por zona") y, a la derecha, los jugados sobre el total en mono.
- **El plazo queda en la bajada del título** y, partido por partido, en *Lo que falta* ("quedan 3 días").
- **"Faltan jugarse 3 partidos y ninguno tiene fecha" sale.** Lo dicen los encabezados de *Lo que falta* ("Sin coordinar · 3") y la cuenta de las barras.

## Por qué

- **Es lo que dibuja la referencia** del sistema visual, y deja de depender de cuántas zonas tiene el torneo.
- **Saca un dato repetido.** El plazo de la fase estaba en la bajada y en el panel.
- **La urgencia está donde se actúa:** cada fila dice cuántos días le quedan a ese partido, al lado de "Escribirles" y "Anotar fecha".

## Qué se resigna

- **El número grande de días**, que se leía de un vistazo al abrir el tablero.
- **Una tarjeta noche menos.** El tablero se queda sin el recurso de jerarquía más fuerte del sistema (design.md §6); lo más fuerte pasa a ser la fila roja de un vencido, que es lo único urgente.
