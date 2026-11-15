# 103 — SetPoint cobra un cargo por jugador inscripto, no una comisión

**Estado:** aceptada — 15 de noviembre de 2026. Reemplaza a la [decisión 078](078-comision-de-la-plataforma.md).

## Contexto

La [decisión 078](078-comision-de-la-plataforma.md) puso una comisión del 5% de la plataforma sobre lo cobrado por MercadoPago, y la landing y el registro la anunciaban. Al pensar cómo hacerla automática aparecieron dos problemas:

- **Con la cuenta única de [05-pagos.md](../05-pagos.md) §2, toda la plata de las inscripciones entra a la cuenta de SetPoint**, que le transfiere a cada organización lo suyo. Para el grupo eso no es aceptable fuera de la demo: la plata de los circuitos no tiene que pasar por la plataforma. Para que llegue a la cuenta de la organización, cada una tiene que conectar su MercadoPago, y eso hace falta con cualquier forma de cobrar.
- **La comisión deja una fuga:** lo que la organización inscribe a mano, cobrado en efectivo o por transferencia (F13, [decisión 079](079-inscribir-a-mano-sin-pasarse-del-cupo.md)), no paga nada. Un circuito podría cobrar todo en mano y no pagar nunca.

## Opciones consideradas

1. **Comisión por inscripción**, descontada en cada pago de MercadoPago con el modelo Marketplace (`marketplace_fee`).
   - En contra: lo cobrado en mano no paga. Además, se suma a la comisión de MercadoPago, y un torneo gratis no deja nada.
2. **Suscripción mensual o anual de la organización.**
   - En contra: los circuitos son de temporada (POLENTA juega 5 torneos por año), y pagar todos los meses sin jugar invita a darse de baja. Una cuota de entrada choca con "probá con un torneo suelto sin configurar nada". Y el cobro recurrente es otra integración, con sus propios estados.
3. **Un cargo fijo por jugador inscripto**, que la organización paga al cerrar la inscripción.
   - En contra: la organización paga un monto al cerrar, en vez de que se descuente solo de cada pago.

## Decisión

Opción 3, elegida por el grupo.

- **Cuenta a todos los inscriptos**, por MercadoPago o a mano. El medio de pago no cambia lo que paga la organización.
- **El primer torneo de cada organización es gratis.** Es la puerta de entrada del producto ([07-configurabilidad.md](../07-configurabilidad.md) §1).
- **El monto todavía no está definido.** La landing y el registro dicen "un monto fijo por cada jugador inscripto", sin número.
- **La conciliación ya no muestra comisión:** "Por MercadoPago" pasa a ser la línea destacada, seguida de lo cobrado por fuera y lo que falta devolver. La constante del 5% y los campos `porcentajeComision`, `comision` y `teCorresponde` se van.
- **No se cobra todavía.** Esta decisión cambia lo que se anuncia y saca la comisión. El pago del cargo al cerrar la inscripción, y que la plata de las inscripciones llegue a la cuenta de cada organización, quedan por hacer (decisión abierta 19 del [README](../README.md)).

## Por qué

- **Sigue el ritmo real de un circuito:** paga cuando hay torneo y en proporción a su tamaño.
- **No hay fuga:** el cargo cuenta jugadores, no plata que pasó por MercadoPago, así que la inscripción a mano de F13 queda como está.
- **Es lo más simple de cobrar:** un solo pago de la organización por categoría, sin `marketplace_fee` en cada inscripción ni cobro recurrente.

## Qué se resigna

- **El ingreso no se descuenta solo de cada pago:** depende de que la organización pague al cerrar. Cerrar la inscripción es lo que habilita el sorteo, así que se puede exigir ahí.
- **Mientras no se cobre, la plataforma no tiene ingreso.** En la demo no cambia nada, porque el pago es simulado ([decisión 053](053-pago-sin-credenciales.md)).
- **La conciliación se aparta de la referencia** (`docs/pantallas/`), que muestra la comisión.
