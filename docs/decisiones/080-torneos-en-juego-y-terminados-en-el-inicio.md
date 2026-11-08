# 080 — El inicio muestra los torneos en juego y los terminados

**Estado:** aceptada — 8 de noviembre de 2026

## Contexto

El inicio del organizador agrupa los torneos por momento (03 §3), pero hasta ahora solo llenaba los borradores, las inscripciones abiertas y los que esperan el sorteo. "En juego" y "Terminados" estaban diseñados y llegaban siempre vacíos, porque el listado no leía partidos ([decisión 063](063-entrada-al-tablero.md)).

La consecuencia, al recorrer la demo de punta a punta: **un torneo desaparecía del inicio al confirmar el sorteo.** Al tablero solo se llegaba desde el Sorteo confirmado, y al Sorteo, desde la tarjeta "Para sortear", que deja de mostrarse con el sorteo confirmado. Un torneo en juego o cerrado se encontraba escribiendo la URL.

Además, el torneo no guardaba cuándo se cerró, y la tabla de terminados de la referencia tiene la columna "Terminó".

## Opciones consideradas

1. **Completar "En juego" y "Terminados" en el inicio**, como están en `pantallas/organizador/home.html`.
   - En contra: el listado del inicio pasa a leer los partidos de los torneos en juego, y se vuelve una consulta más pesada.
2. **Que `/torneos/:id` lleve a la pantalla que corresponde según el estado** (borrador al editor, en juego al tablero, terminado al cierre).
   - En contra: sola no ayuda a encontrar el torneo; solo hace que cualquier enlace lleve al lugar correcto.
3. **Una sección "Torneos" en la navegación**, con la lista completa.
   - En contra: es una pantalla nueva que repite buena parte del inicio.

Para la fecha de "Terminó":

- **a. Una columna nueva, `Torneo.cerradoEn`**, que se escribe al cerrar.
  - En contra: una migración, y los cerrados antes de que existiera quedan sin fecha.
- **b. Sacar la columna.**
  - En contra: se aparta de la referencia, y la tabla queda sin un orden que se entienda a simple vista.
- **c. La fecha en que se cargó el resultado de la final.**
  - En contra: corregir la final después del cierre ([decisión 055](055-correccion-despues-del-cierre.md)) la mueve; diría cuándo se cargó, no cuándo terminó.

## Decisión

Opción 1, con la columna nueva (a). Elegidas por el grupo.

- **En juego:** una tarjeta por categoría desde que se confirma el sorteo hasta que se cierra (`zonas_generadas`, `grupos_en_curso` y `eliminatorias`), con la fase, los partidos jugados sobre el total, los vencidos y qué se está jugando hasta cuándo: "16 jugadores · zonas hasta el miércoles 18", "12 jugadores · semifinales hasta el sábado 21". Si ya está todo jugado, dice qué falta hacer: cerrar las zonas o cerrar el torneo. "Ver tablero" lleva a `/torneos/:id/tablero`.
- **Los partidos son los del torneo entero:** los de las zonas y, desde que se cierran, también los de los cuadros, que se arman todos juntos ([decisión 026](026-cierre-de-zonas.md)). Vencido y el plazo que corre se calculan con las mismas funciones que el tablero ([decisión 060](060-partidos-vencidos-calculados.md)). En los cuadros, la ronda que se nombra es la del partido pendiente que vence primero: la más atrasada.
- **Terminados:** una fila por categoría cerrada, de la que se cerró último a la primera, con la fecha del cierre, el campeón del cuadro principal y los jugadores. Cada una lleva a `/torneos/:id/cierre`. Se ven las últimas 5, y "Ver los N torneos terminados" despliega el resto en la misma tabla.
- **La API es el mismo listado** (`GET /api/organizaciones/:slug/torneos`): cada torneo suma `avance` (en juego) y `terminado` (cerrado), `null` en los demás estados. Los partidos se leen en una sola consulta para todos los torneos; de los cerrados, solo los del cuadro principal.
- **`Torneo.cerradoEn`** se escribe al cerrar, con el mismo instante que la fecha de los movimientos de ranking del cierre.
- "Necesita tu atención" queda para otro PR: la regla de "pocos inscriptos" no está escrita, y las vinculaciones para revisar son de F12.

## Por qué

- **Es lo que la referencia ya muestra**, y la tarjeta y la tabla ya existían: lo que faltaba eran los datos. El inicio pasa a ser la entrada a cualquier torneo, en cualquier momento.
- **Un vencido es lo mismo en el inicio que en el tablero:** sale de la misma cuenta, y por eso la tarjeta y el tablero nunca dicen cosas distintas.
- **Sin pantalla nueva:** desplegar los terminados en la misma tabla evita un listado aparte, y el botón "Ver los N" ya no queda sin hacer nada.
- **La fecha del cierre es un hecho que no se puede reconstruir después:** si no se guarda al cerrar, ninguna otra fecha la reemplaza sin moverse con las correcciones.

## Qué se resigna

- **El inicio hace una consulta más**, que crece con los partidos de los torneos en juego. Con los volúmenes de un circuito amateur (78 partidos por torneo) no se nota.
- **Los torneos cerrados antes de esta migración no tienen fecha:** muestran "—" y van al final de la tabla. En el seed no hay ninguno.
- **`/torneos/:id` sigue siendo el editor de la convocatoria**, aunque el torneo esté en juego (opción 2). Queda como mejora barata si hace falta.
- **Con muchos años de torneos, la tabla de terminados se alarga** al desplegarla. Cuando moleste, se resuelve con un listado propio.
