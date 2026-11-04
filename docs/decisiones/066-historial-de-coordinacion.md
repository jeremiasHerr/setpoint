# 066 — El historial de coordinación se guarda desde F14

**Estado:** aceptada — 3 de noviembre de 2026

## Contexto

Cuando un partido no se juega en plazo, lo resuelve la organización. Para eso, [02-dominio.md](../02-dominio.md) §8.4 dice que el sistema le presenta "el historial de coordinación (quién propuso qué, quién no respondió)". El schema guardaba solo la fecha actual, quién la anotó y quién la confirmó: cada cambio pisa al anterior.

El tablero (F15) ya muestra los vencidos ([decisión 060](060-partidos-vencidos-calculados.md)), pero todavía no muestra ese historial.

## Opciones consideradas

1. **Una tabla de eventos** (`eventos_coordinacion`), que se escribe desde F14: anotó, cambió, reprogramó, confirmó.
   - En contra: una migración y una escritura más en cada endpoint, para algo que todavía no se muestra.
2. **Solo los campos actuales del partido.**
   - En contra: el historial no se puede reconstruir después. Los torneos que se jueguen antes de mostrarlo llegarían sin historial.

## Decisión

Opción 1.

- **`EventoCoordinacion`** guarda el tipo, quién lo hizo, si fue la organización, y la fecha y la sede como quedaron.
- **Se escribe en la misma transacción** que cambia el partido.
- **No hay evento de vencimiento:** vencido se calcula con la fecha límite, no se guarda (decisión 060).
- **Solo se agrega**, nunca se edita ni se borra, salvo con el partido.
- **No tiene `organizacion_id`**: cuelga del partido, como los sets, y se llega a él por el torneo.

## Por qué

- **Es lo que pide el dominio** para que la resolución de un partido no jugado no sea arbitraria.
- **Lo que no se guarda ahora no se recupera.** Agregar la tabla cuando se muestre dejaría sin historial a los partidos que se coordinen mientras tanto.

## Qué se resigna

- **Una tabla que, por ahora, nadie lee** desde la interfaz. Mostrarla al resolver un vencido en el tablero queda pendiente.
