# 135 — El tablero suma extender el plazo, el doble W.O. y recordarles

**Estado:** aceptada — 22 de noviembre de 2026. Reemplaza en parte a la [062](062-acciones-del-tablero.md), que dejaba afuera estas tres acciones.

## Contexto

La decisión 062 dejó el tablero con dos acciones: Resolver un vencido con el W.O. y Escribirles por WhatsApp. Extender el plazo, el doble W.O. y "Recordarles" quedaron afuera a propósito, para sumarlos si alguien los pedía, y se pidieron.

Son tres casos que el reglamento ya describe o que la organización hace a mano (02-dominio §8.4): "en la práctica agregan días", a veces ninguno de los dos se presenta, y antes de dar un W.O. se les avisa.

## Opciones consideradas

Extender el plazo:

1. **De un partido.**
   - En contra: si se atrasa toda la zona, hay que hacerlo partido por partido.
2. **De toda la fase o la ronda.**
   - En contra: el reglamento pide cumplir el cronograma sin excepción, y corre las fechas de todos por un caso.

El doble W.O. en la tabla:

1. **Pierden los dos 0-6 0-6.** Es el W.O. de 02-dominio §8.5 aplicado a los dos: nadie suma el partido.
   - En contra: el reglamento no lo dice.
2. **Partido anulado,** que no cuenta para nadie.
   - En contra: deja a esos dos con un partido menos que el resto, y comparar zonas se complica (decisión 018).

Recordarles:

1. **Aviso al celular y email.**
   - En contra: muchos jugadores todavía no tienen cuenta.
2. **Solo email.**
   - En contra: deja afuera el aviso al celular, que es lo que más se lee.

## Decisión

En los tres casos, la opción 1, elegida por el grupo.

- **"Más" en cada fila de lo que falta** abre debajo las tres acciones, como Escribirles y Anotar fecha. No suma botones a la fila.
- **Extender el plazo** cambia la fecha límite de ese partido, solo hacia adelante, y deja un evento `PLAZO_EXTENDIDO` en el historial de coordinación (decisión 066), con la fecha nueva. `PATCH .../tablero/partidos/:partidoId/plazo`.
- **El doble W.O. es un tipo de resultado más,** `doble_walkover`, con el estado `DOBLE_WALKOVER` y sin ganador. Se carga desde *Cargar resultado*, con "No se presentó ninguno", igual que Resolver abre el W.O. (decisión 062). Así tiene la vista previa de la zona, la regla de corrección con las zonas cerradas (decisión 028) y el reemplazo de los resultados que cargaron los jugadores.
  - **Solo en las zonas:** en un cuadro alguien tiene que avanzar.
  - **En la tabla, los dos pierden 0-6 0-6:** cuentan el partido como jugado y perdido. Entre ellos no desempata, y se pasa al ranking (decisión 017).
  - **Cuenta como resuelto** para el avance, los vencidos y el cierre de las zonas. Como el W.O., no entra en la ficha ni en el cara a cara, porque no se jugó (decisión 073). La IA de los mensajes no lo lee: lo da la organización.
- **Recordarles** manda un aviso al celular a quien tiene la app (el mismo servicio del fixture, decisión 047) y un email a quien tiene cuenta. La fila dice a quién le llegó por cada camino, y a quién no le llegó, para escribirle por WhatsApp. `POST .../tablero/partidos/:partidoId/recordatorio`.

## Por qué

- **Extender un partido es lo que se hace hoy:** se acomoda un caso, no el cronograma.
- **El doble W.O. como 0-6 0-6 es la regla que ya existe,** aplicada a los dos: no hay una cuenta nueva que explicar.
- **Como resultado, no duplica nada:** valida, simula y corrige con lo que ya hace la carga.

## Qué se resigna

- **Un estado nuevo de partido y un tipo nuevo de evento**, con su migración.
- **El recordatorio no se limita:** se puede mandar más de una vez. La fila lo deshabilita después de mandarlo, hasta recargar.
- **Quien no tiene cuenta no recibe el recordatorio:** sigue con Escribirles.
