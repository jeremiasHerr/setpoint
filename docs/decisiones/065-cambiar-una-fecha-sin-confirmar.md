# 065 — Cambiar una fecha sin confirmar no es reprogramar

**Estado:** aceptada — 3 de noviembre de 2026

## Contexto

El reglamento admite **una sola reprogramación** por partido, con 24 horas de anticipación ([02-dominio.md](../02-dominio.md) §8.3). En la app, un jugador anota la fecha y el rival la confirma con un toque ([04-flujo-jugador.md](../04-flujo-jugador.md) §6.2). Falta qué hace el rival si no puede ese día: la confirmación no tiene un "no puedo", y el sistema de propuestas y contrapropuestas se descartó en §6.1.

## Opciones consideradas

1. **Cualquiera de los dos puede cambiar una fecha todavía sin confirmar, sin que cuente como reprogramación.** Reprogramar es cambiar una fecha ya confirmada.
   - En contra: dos jugadores podrían cambiarla una y otra vez sin ponerse de acuerdo.
2. **Todo cambio cuenta como reprogramación**, esté confirmada o no.
   - En contra: un rival que no puede el día que le anotaron gasta la única reprogramación sin haber acordado nada.
3. **Un botón para rechazar**, que vuelve el partido a sin coordinar.
   - En contra: es el comienzo del ida y vuelta de propuestas que se descartó, y un paso más para un rechazo que igual se habla por WhatsApp.

## Decisión

Opción 1.

- **Sin fecha:** anotarla deja el partido en `anotada`.
- **Con una fecha `anotada`:** cualquiera de los dos la cambia. Sigue `anotada`, ahora a nombre de quien la cambió, y el otro confirma.
- **Con una fecha `confirmada`:** cambiarla es reprogramar. Se puede si quedan reprogramaciones y faltan al menos las horas de antelación del torneo ([decisión 067](067-parametros-de-reprogramacion.md)). Vuelve a `anotada` y suma una.
- **Si no se puede**, la app no deja cambiarla: la organización sí, dentro del plazo ([decisión 064](064-la-fecha-de-la-organizacion-queda-confirmada.md)).

## Por qué

- **Una fecha sin confirmar todavía no es un acuerdo.** El reglamento pide registrar los turnos "una vez confirmados por ambos", y la reprogramación es sobre un turno pactado.
- **Es lo que pasa hoy en el grupo:** uno propone, el otro dice "ese día no, ¿el jueves?", y recién cuando los dos están de acuerdo queda el turno.

## Qué se resigna

- **Un tope a los cambios sin confirmar.** Si dos jugadores no se ponen de acuerdo, el partido llega al fin del plazo y lo resuelve la organización, con el historial de cada cambio ([decisión 066](066-historial-de-coordinacion.md)).
