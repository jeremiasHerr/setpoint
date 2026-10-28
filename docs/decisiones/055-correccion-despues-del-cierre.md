# 055 — Un resultado se puede corregir con el torneo cerrado, y los puntos se recalculan

**Estado:** aceptada — 27 de octubre de 2026. Reemplaza el punto "Torneo finalizado" de la [decisión 028](028-correccion-de-resultados.md).

## Contexto

Al cerrar el torneo (F16), cada jugador recibe un `MovimientoRanking` con los puntos de su instancia. La [decisión 028](028-correccion-de-resultados.md) decía que con el torneo finalizado no se corrige nada, porque los puntos ya se repartieron. Pero F16 pide lo contrario ("si se corrige un resultado después del cierre, el ranking se recalcula"), y la pantalla de referencia *Cerrar el torneo* se lo avisa a la organización antes de confirmar.

El caso real es un error de tipeo descubierto después de cerrar: el marcador de la final cargado al revés, o un set mal anotado.

## Opciones consideradas

1. **Nunca**, como decía la 028.
   - En contra: contradice F16 y la pantalla. Un error en la final queda para siempre en el ranking, o se arregla con un ajuste manual que nadie entiende después.
2. **Se corrige con las reglas de la 028, y al guardar se recalculan los puntos del torneo.**
   - En contra: los movimientos del torneo dejan de ser un registro que nunca se toca.
3. **Un botón "Reabrir"** que borra los puntos y vuelve el torneo a cuadros; se corrige y se cierra de nuevo.
   - En contra: es otro estado y otra acción que explicar, y mientras está abierto el ranking público no tiene esos puntos.

## Decisión

Opción 2.

- **Las reglas de corrección son las de la 028**: con las zonas cerradas, solo si la siembra de los cuadros no cambia; en un cuadro, si cambia el ganador, solo si el partido siguiente no se jugó. Con el torneo cerrado todos los partidos están jugados, así que en la práctica solo puede cambiar el ganador de una final.
- **En la misma transacción del resultado**, `recalcularPuntos()` vuelve a calcular la instancia de cada jugador y **actualiza en su lugar** el movimiento de quien cambió de instancia, con la tabla de puntos vigente.
- **Los movimientos conservan la fecha del cierre.** Si se crearan de nuevo, serían los más recientes de su casillero y le ganarían a un torneo del mismo calendario cerrado después.
- **Un torneo cancelado sigue sin aceptar resultados** (`409 TORNEO_CANCELADO`, antes `TORNEO_TERMINADO`).
- **Cierre y corrección no se pisan:** los dos actualizan primero la fila del torneo, así que uno espera al otro. Si el cierre llega mientras se guarda una corrección, la corrección ve el torneo cerrado y recalcula.

## Por qué

- **Es lo que prometen F16 y la pantalla**, y el error que se corrige es el más común: de tipeo.
- **No agrega estados ni pantallas.** Se corrige desde la misma *Cargar resultado*, como cualquier otro resultado.
- **El ranking ya se calcula en cada consulta** a partir de los movimientos: con el movimiento actualizado, el ranking público queda bien al instante.

## Qué se resigna

- **No queda registro de los puntos anteriores a la corrección.** El movimiento se actualiza, no se revierte con otro (el motivo `REVERSION` del schema sigue sin usarse). Para un error de tipeo alcanza; si hiciera falta auditar quién cambió qué, habría que guardar el historial.
- **Si la organización cambió la tabla de puntos después de cerrar**, quien cambia de instancia recibe los puntos de la tabla nueva. Los demás jugadores del torneo conservan los que recibieron al cerrar.
