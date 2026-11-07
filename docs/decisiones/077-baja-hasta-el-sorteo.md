# 077 — Se puede dar de baja e inscribir a mano hasta que se confirma el sorteo

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

F13 pide dar de baja a quien se arrepiente, liberando el cupo, e inscribir a mano a quien pagó por fuera. Las dos cambian quién juega. Después de confirmar el sorteo, los jugadores ya tienen zona y partidos ([decisión 014](014-borrador-del-sorteo.md)), y nadie de la lista de espera puede entrar en su lugar sin rehacer las zonas.

Para quien no juega después del sorteo, el tablero ya tiene una salida: resolver sus partidos con un W.O. ([decisión 062](062-acciones-del-tablero.md)).

## Opciones consideradas

1. **Solo hasta el sorteo.** "Dar de baja" existe mientras se puede reemplazar al jugador con la lista de espera.
   - En contra: una baja tardía no queda registrada, ni dice si corresponde devolución.
2. **También después, con W.O.:** se registra la baja y la devolución, y sus partidos sin jugar pasan solos a W.O.
   - En contra: toca zonas ya armadas y la carga de resultados, y nadie entra en su lugar.
3. **Después del sorteo, solo la devolución**, sin dar de baja.
   - En contra: dos acciones parecidas en la misma pantalla.

## Decisión

Opción 1, elegida por el grupo. `sePuedeModificar()`, en `apps/api/src/modules/inscripciones/lista-de-espera.ts`: con la inscripción abierta o cerrada, mientras el sorteo no está confirmado.

- **Dar de baja, inscribir a mano y la lista de espera** usan la misma regla. Con el sorteo confirmado la API responde `SORTEO_CONFIRMADO`, y la pantalla no muestra los botones.
- **Si hay un borrador del sorteo**, la baja lo descarta: tenía a quien se fue. Inscribir a mano no hace falta descartarlo, porque un borrador con un pagado sin zona ya no sirve.
- **Marcar una devolución** se puede siempre.

## Por qué

- **Es cuando la baja sirve para algo:** el lugar todavía se puede dar a otro.
- **No toca las zonas ni los partidos**, que ya tienen su forma de resolver a quien no juega.
- **El reglamento ya lo resuelve así:** quien no puede jugar da W.O. ([02-dominio.md](../02-dominio.md) §8.3).

## Qué se resigna

- **Una baja después del sorteo no queda en Inscripciones**, y si corresponde devolverle la plata, la organización lo anota por fuera.
- **Con el sorteo confirmado, la lista de espera termina** aunque alguien todavía tuviera su reserva de 24 horas: no entra al sorteo, como las reservas sin pagar al cerrar ([decisión 024](024-reservas-sin-pagar-al-cerrar.md)).
