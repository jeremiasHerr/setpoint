# 071 — La ficha del jugador suma una sección Torneos, con la instancia y los puntos de cada uno

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

F17 pide que la ficha pública del jugador muestre su historial completo de partidos, sus números (jugados, ganados, perdidos), **los torneos que disputó con la instancia que alcanzó en cada uno** y **la evolución de sus puntos torneo por torneo** ([10-features.md](../10-features.md)).

La pantalla de referencia ([ficha-y-cara-a-cara.html](../pantallas/publico/ficha-y-cara-a-cara.html)) muestra los números, una barra por torneo del calendario con los puntos vigentes de cada casillero y los últimos partidos. No tiene los torneos disputados, y las barras dicen de dónde salen los puntos de hoy, no cómo fueron cambiando.

## Opciones consideradas

1. **Una sección Torneos debajo de las barras:** cada torneo jugado, con la instancia que alcanzó y los puntos que le dio.
   - En contra: es una sección sin referencia visual, armada con las piezas de la pantalla.
2. **Los partidos agrupados por torneo**, con la instancia y los puntos en el encabezado de cada grupo.
   - En contra: se aleja de "Últimos partidos" de la referencia, y la lista se hace larga.
3. **Solo lo que dibuja la referencia.**
   - En contra: los torneos disputados y la evolución quedan a medias, y en la defensa F17 no está completa.

## Decisión

Opción 1, elegida por el grupo.

- **Torneos** va debajo de *Puntos por torneo del calendario*, con la cantidad al lado del título.
- Cada fila dice el nombre del torneo y su categoría a la izquierda, y a la derecha hasta dónde llegó ([decisión 072](072-la-instancia-se-calcula-con-los-partidos.md)). Debajo, si fue en el cuadro consuelo, el nombre del cuadro, y los puntos que le dio el cierre.
- Entran los torneos de la organización en los que tiene partidos, de cualquier categoría, del más reciente al más viejo por la fecha de inicio. Un torneo cancelado no entra.
- Los puntos son los del movimiento que guarda el cierre (F16), que la corrección después del cierre actualiza en su lugar ([decisión 055](055-correccion-despues-del-cierre.md)). Un torneo que no da puntos, o que todavía no cerró, no los muestra.
- **Partidos** queda como en la referencia, pero con todos: se ven los últimos 5 y "Ver los N partidos" despliega el resto en el lugar. F17 pide el historial completo.
- La lógica está en `historialDelJugador()`, en `apps/api/src/modules/ficha/ficha.ts`; la sección, en `TorneosDeLaFicha`.

## Por qué

- **Cubre F17 sin gráfico:** la evolución torneo por torneo es la lista de lo que sumó en cada uno, en orden, y es lo que se lee en la planilla de hoy.
- **Es la pregunta que hace quien abre la ficha:** hasta dónde llegó en cada torneo. Las barras responden otra: de qué casillero salen sus puntos de hoy.
- **No hace falta otra pantalla ni otra ruta:** sale de la misma consulta que los partidos.

## Qué se resigna

- **No hay una curva del acumulado ni del puesto en el tiempo.** Calcular el puesto después de cada torneo obligaría a rehacer el ranking de toda la categoría en cada fecha.
- **Los puntos importados de la planilla no aparecen como torneos:** no hay un torneo jugado en el sistema del que salgan. Se ven solo en las barras.
- **Sin referencia visual,** la sección usa las medidas de las filas de *Partidos*. Si se dibuja, se ajusta a lo dibujado.
