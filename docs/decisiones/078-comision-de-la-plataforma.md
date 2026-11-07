# 078 — La conciliación cobra una comisión del 5% sobre lo cobrado por MercadoPago

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

F13 pide la conciliación del torneo: cuánto se recaudó, cuánto le corresponde a la organización y qué devoluciones quedaron pendientes. Con la cuenta única de [05-pagos.md](../05-pagos.md) §2, la plata de MercadoPago entra a la cuenta de la plataforma, que después le transfiere a la organización lo suyo, por fuera del sistema. 05 §2 prevé una comisión, pero ningún documento dice cuánto. La pantalla de referencia muestra $63.000 sobre $1.260.000, que es un 5%, sin explicarlo.

## Opciones consideradas

1. **Un 5% fijo de la plataforma**, solo sobre lo cobrado por MercadoPago.
   - En contra: es un valor de ejemplo, sin un acuerdo comercial detrás.
2. **La comisión real de MercadoPago**, leída de cada pago.
   - En contra: el pago simulado sin credenciales ([decisión 053](053-pago-sin-credenciales.md)) no tiene comisión, así que en la demo da 0.
3. **Sin comisión:** recaudado, cobrado por fuera y devoluciones.
   - En contra: la conciliación queda más pobre que la referencia, y el modelo de cuenta única la prevé.

## Decisión

Opción 1, elegida por el grupo. `conciliacion()`, en `apps/api/src/modules/inscripciones/conciliacion.ts`, con `COMISION = 0.05`:

- **Por MercadoPago:** los pagos cobrados con ese medio, también los que después se devolvieron, porque la plata entró.
- **Comisión de SetPoint:** el 5% de eso, redondeado a los centavos.
- **Te corresponde:** lo de MercadoPago menos la comisión. Es lo que la plataforma le transfiere a la organización.
- **Cobraste por fuera:** efectivo, transferencia u otro. Ya lo tiene la organización: no paga comisión.
- **A devolver por fuera:** las devoluciones pendientes ([decisión 075](075-la-devolucion-se-anota.md)). No se resta: la hace la organización.
- **Se calcula en cada consulta**, con los pagos del torneo. Un pago de 0, de un torneo gratis, no cuenta como cobro.

## Por qué

- **Es el número de la referencia**, y la demo muestra una conciliación con sentido aunque el pago sea simulado.
- **Cobrar comisión sobre el efectivo no tiene sentido:** esa plata nunca pasó por la plataforma.
- **Calcularla al consultar** sigue la misma idea que las tablas y el ranking: no hay un total guardado que se desincronice.

## Qué se resigna

- **El 5% es un supuesto**, fijo en el código. Si hubiera un acuerdo comercial, sería un parámetro de la plataforma o de la organización.
- **La tabla `Liquidacion` sigue sin uso.** Sirve para cuando la plataforma registre la transferencia hecha; hoy esa transferencia queda fuera del sistema.
- **No descuenta la comisión real de MercadoPago:** en una cuenta real, lo que cobra MercadoPago sale de la parte de la plataforma.
