# 142 — Los resultados desde los mensajes se leen con Sonnet; la importación sigue con Haiku

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

Las dos funcionalidades de IA usaban Claude Haiku 4.5. En la importación funciona: su eval da 991 / 991 ([06-ia.md](../06-ia.md) §1).

En los resultados desde los mensajes (F19), el eval se corrió por primera vez contra la IA real el 23 de noviembre y dio **3 / 7**. El modelo se equivocaba sobre todo al orientar el resultado: invertía los sets de un mensaje escrito por el que perdió e invertía el ganador de un W.O. Lo mismo pasó al probar con un chat de la demo. "Villalobos abandonó", mandado por su rival, se leyó con Villalobos como ganador, y "Montecino me ganó" se asignó a un partido de otro jugador.

La auditoría frena esos errores ([PR #193](https://github.com/jeremiasHerr/setpoint/pull/193)), pero los manda a revisión. Con 4 de 7 mal leídos, F19 casi no carga nada solo, y eso es lo que tiene que hacer.

## Opciones consideradas

1. **Leer los mensajes con Claude Sonnet 5.5 y dejar la importación en Haiku.**
2. **Seguir con Haiku y pasar al código lo que le cuesta al modelo.** El modelo copiaría los sets como vienen escritos y diría quién ganó por nombre. El código elegiría el partido y orientaría los sets.
   - En contra: cambia el schema de la respuesta, el prompt y la auditoría, y la mejora no está medida.
3. **Seguir con Haiku y mejorar solo el prompt, con ejemplos.**
   - En contra: la ganancia es incierta. Los errores son justo de orientar A y B, y el prompt ya lo explica con un ejemplo.

## Decisión

Opción 1, elegida por el grupo.

- **Cada funcionalidad tiene su modelo**, en `lib/ia.ts`: la importación, `claude-haiku-4-5`, y los mensajes, `claude-sonnet-5-5`.
- **El tope de gasto cuenta cada pedido con el precio de su modelo.** Haiku cuesta US$ 1 / 5 por millón de tokens y Sonnet US$ 2 / 10. Como cada funcionalidad usa un solo modelo, el gasto se suma por función, sin una columna nueva. Los precios dejan de estar en variables de entorno (`IA_PRECIO_*`): están en el código, junto al modelo, porque cambian juntos. El tope (`IA_TOPE_DIARIO_USD`) y el límite de pedidos siguen igual ([decisión 121](121-limites-de-la-ia.md)).
- **Sonnet 5.5 va sin `temperature`,** porque no la acepta. Si un clasificador de seguridad rechaza el pedido, la API lo reintenta con otro modelo (`fallbacks: "default"`). Si lo rechaza toda la cadena, la lectura termina en error con el motivo.
- **Si el mensaje no nombra a uno de los jugadores del partido elegido,** la revisión no propone resultado: probablemente es otro partido. Queda "Abrir en Cargar resultado".
- **El eval suma el chat de la demo** (`02-abandono-y-perdedor`).

## Por qué

- **Está medido.** Con los dos chats, Sonnet da 10 / 10, con 9 cargados solos y 0 mal. Con Haiku, en el chat 01, daba 3 / 7.
- **El costo sigue siendo de centavos.** Una lectura cuesta unos US$ 0,02, contra US$ 0,004 con Haiku. Con el tope de US$ 2 por día alcanza para unas cien lecturas por organización.
- **F19 es la funcionalidad de IA del uso diario** ([decisión 117](117-las-proyecciones-no-son-ia.md)). Si casi todo va a revisión, no ahorra trabajo, que es lo que pidió la devolución del 25%.
- **La importación no lo necesita.** Copiar números de una tabla le sale perfecto a Haiku, y cada número se audita contra la planilla.

## Qué se resigna

- **Cada lectura cuesta unas cinco veces más** que con Haiku.
- **Las respuestas de Sonnet pueden variar un poco entre corridas,** porque no acepta `temperature: 0`. Los controles del código son los mismos.
- **Para cambiar el precio de un modelo hay que tocar el código**, ya no alcanza con una variable de entorno.
- **La muestra sigue siendo chica:** 10 resultados en dos chats. Faltan las capturas reales del grupo de POLENTA.
