# 139 — El pago se resuelve en el momento, sin efectivo

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

El cupo se reserva 15 minutos antes de ir al checkout, y la preferencia de MercadoPago vence con la reserva ([05-pagos.md](../05-pagos.md) §5). Pero el checkout aceptaba pagos que no se resuelven en el momento: un cupón de Rapipago o Pago Fácil generado dentro de los 15 minutos se puede pagar días después, y una tarjeta puede quedar "en proceso" de revisión.

Para entonces la reserva venció y el lugar pasó al siguiente de la lista de espera. Cuando llega el pago aprobado, la API confirma la inscripción igual, porque el jugador ya pagó, sin mirar el cupo: el torneo queda con más inscriptos que lugares.

Con la versión publicada cobrando de verdad ([decisión 137](137-cada-organizacion-cobra-con-su-mercadopago.md)), deja de ser un caso teórico.

## Opciones consideradas

1. **Que el pago se resuelva en el momento y no aceptar efectivo:** `binary_mode` en la preferencia, y Rapipago, Pago Fácil y los cajeros afuera.
   - En contra: quien no tiene tarjeta ni dinero en MercadoPago no puede pagar online.
2. **Aceptar el pago tardío y, si ya no hay lugar, anotar que corresponde devolverlo**, como en una baja ([decisión 075](075-la-devolucion-se-anota.md)).
   - En contra: más código, y la organización tiene que devolver la plata a mano.
3. **Dejarlo como está.**
   - En contra: con jugadores reales, tarde o temprano se pasa del cupo.

## Decisión

Opción 1, elegida por el grupo.

- **`binary_mode: true`:** MercadoPago aprueba o rechaza el pago en el momento, sin estados pendientes.
- **Sin los medios de pago `ticket` (Rapipago, Pago Fácil) ni `atm` (cajeros).** Quedan las tarjetas y el dinero en cuenta de MercadoPago.

## Por qué

- **El pago termina dentro de la reserva,** que es lo que la reserva supone: el cupo no se puede pasar.
- **Es un cambio en la preferencia,** sin lógica nueva en la API ni en las pantallas.
- **Quien quiere pagar en efectivo sigue pudiendo:** le paga a la organización, y ella lo inscribe a mano (05-pagos §8), que es lo que pasa hoy.

## Qué se resigna

- **Pagar online en efectivo.** Para un jugador sin tarjeta, vuelve el arreglo por fuera.
- **Algún pago que MercadoPago habría aprobado después de revisarlo** se rechaza en el momento: el jugador lo vuelve a intentar, con otra tarjeta si hace falta.
