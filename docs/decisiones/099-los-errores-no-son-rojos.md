# 099 — Los errores no son rojos

**Estado:** aceptada — 14 de noviembre de 2026

## Contexto

design.md dice que el rojo significa solo vencimiento: "No se usa para error de formulario ni para eliminar". La app y el flujo del jugador lo respetaban, pero la web de la organización usaba rojo en todos sus errores: los de los formularios, los de las acciones que fallan y las filas de la importación que hay que revisar. El mismo "Ese código no es" salía rojo en el registro y con borde negro en la inscripción. Cada pantalla tenía su propia forma de mostrar un error.

## Opciones consideradas

1. **Como dice design.md**: los errores en negro, con un solo componente para toda la web.
   - En contra: un error se distingue menos de un texto común; lo sostiene el borde y el peso de la letra.
2. **Cambiar design.md**: el rojo pasa a significar también error.
   - En contra: hay que reescribir la regla y rehacer la app y el flujo del jugador, que ya la cumplían. Y un partido vencido deja de ser lo único rojo de la pantalla, que es lo que lo hace urgente.

## Decisión

Opción 1, elegida por el grupo.

- **Un solo componente, `components/Aviso.tsx`**, con dos formas: `Aviso`, un bloque con borde negro para el error de un formulario entero o de una acción ("No pudimos ingresar"), con la primera frase opcional en negrita; y `MensajeError`, una línea en negro, peso 500, debajo del campo o de la acción que falló.
- **Lo usa toda la web**, también el flujo del jugador, que ya tenía el borde negro en "Ese código no es".
- **Lo que hay que revisar en la importación** se marca con borde negro, como en *Revisar vinculación*: no venció nada.
- **Sigue en rojo lo que vence**: los partidos vencidos, la reserva vencida, el código que venció, el plazo de la zona.

## Por qué

- **Es lo que ya decía el documento** y lo que ya hacían la app y el flujo del jugador: cambia la web de la organización, no la regla.
- **El rojo sigue significando una sola cosa.** En el tablero, un partido vencido es lo único rojo de la pantalla; si los errores también lo fueran, dejaría de destacar.

## Qué se resigna

- **Un error se distingue menos a primera vista** que en rojo. Lo compensa el borde negro y que el aviso dice qué pasó y qué hacer.
