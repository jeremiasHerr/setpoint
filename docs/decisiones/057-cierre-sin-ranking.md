# 057 — Un torneo que no da puntos se cierra igual, con sus posiciones finales

**Estado:** aceptada — 27 de octubre de 2026

## Contexto

Un torneo da puntos si la organización lleva ranking (`usaRanking`) y el torneo pertenece a un torneo del calendario (`etapaId`), porque los puntos van a ese casillero. Un torneo suelto, o uno de una organización sin ranking, no tiene dónde ponerlos. F16 dice que en ese caso "el cierre produce la tabla de posiciones finales del torneo y no otorga puntos", pero la pantalla de referencia está pensada para el caso con ranking.

## Opciones consideradas

1. **La misma pantalla, sin lo del ranking:** campeones y la instancia de cada jugador, sin las columnas de puntos ni el panel del ranking.
   - En contra: la tabla queda con dos columnas y casi todos en participación.
2. **Solo cerrar:** un botón con los campeones, sin la lista de jugadores.
   - En contra: F16 promete las posiciones finales.

## Decisión

Opción 1.

- **La tabla se titula "Posiciones finales"** y muestra jugador e instancia. El botón dice "Cerrar el torneo" en lugar de "Cerrar y actualizar el ranking".
- **No se guarda nada además del estado.** La instancia de cada uno se deduce de los cuadros, con la misma cuenta que usa el torneo con ranking.

## Por qué

- **Una sola pantalla y una sola cuenta** para los dos casos: lo único que cambia es si se guardan movimientos.
- **Las posiciones finales no necesitan tabla propia:** salen de los cuadros, que no cambian después del cierre salvo por una corrección ([decisión 055](055-correccion-despues-del-cierre.md)).

## Qué se resigna

- **Las posiciones son instancias, no un orden completo:** no distingue entre los que perdieron en la misma ronda ni ordena el cuadro consuelo. Para eso haría falta otra regla que el reglamento no tiene.
- **Si la organización activa el ranking después, sus torneos sueltos ya cerrados no suman.** Es coherente con el modelo: un torneo suelto no tiene casillero.
