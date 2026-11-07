# 079 — Inscribir a mano no puede pasarse del cupo

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

F13 pide que la organización pueda inscribir a mano a quien le pagó en efectivo o por transferencia ([05-pagos.md](../05-pagos.md) §8). Hay que decidir qué pasa si el cupo ya está lleno, con pagados, reservas en curso o gente esperando en la lista.

## Opciones consideradas

1. **No deja:** dice que no quedan lugares.
   - En contra: un paso más para quien ya cobró en mano.
2. **Deja pasarse del cupo**, con un aviso.
   - En contra: más inscriptos que lugares, y el formato de las zonas está pensado para el cupo.
3. **Lo anota en la lista de espera**, con el pago registrado.
   - En contra: alguien que ya pagó puede no entrar nunca, y habría que registrar su devolución.

## Decisión

Opción 1, elegida por el grupo: si la organización cobró por fuera con el cupo lleno, es un acuerdo suyo, y el sistema no lo convierte en un lugar más.

- **Con el cupo lleno, "Inscribir a mano" se ve deshabilitado** y dice "No quedan lugares para inscribir a mano". La API responde `SIN_LUGARES`.
- **Si el jugador estaba reservando, se confirma su reserva** y no ocupa otro lugar.
- **Solo jugadores del padrón**, de la categoría del torneo. El monto arranca con el precio y se puede cambiar.
- **No vincula ninguna cuenta ni manda comprobante:** el pago lo recibió la organización.
- **No se puede volver a inscribir a quien se dio de baja** después de pagar: una inscripción tiene un solo pago, y la conciliación perdería lo cobrado ([decisión 075](075-la-devolucion-se-anota.md)).

## Por qué

- **El cupo es lo que se publicó:** pasarlo cambia las zonas y lo que se le prometió a la lista de espera.
- **Una regla sola para todos los caminos:** el link, la lista de espera y la organización compiten por los mismos lugares, en la misma transacción.

## Qué se resigna

- **Con el cupo lleno, a quien está reservando y paga en mano no se lo puede confirmar desde la pantalla**, aunque la API lo permite: el botón sigue la referencia y queda deshabilitado. Puede pagar con el link, que sigue andando.
- **Para sumar a alguien con el cupo lleno**, la organización tiene que subir el cupo del torneo mientras la inscripción está abierta, y ese lugar nuevo va primero a la lista de espera ([decisión 076](076-lista-de-espera-24-horas.md)).
