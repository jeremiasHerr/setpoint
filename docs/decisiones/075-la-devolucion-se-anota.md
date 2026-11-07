# 075 — Al dar de baja, el sistema anota si corresponde la devolución; el dinero lo mueve la organización

**Estado:** aceptada — 7 de noviembre de 2026. Deja de bloquear la decisión abierta 11 del [README](../README.md): qué devuelve POLENTA es un dato de su reglamento, no del sistema.

## Contexto

F13 pide dar de baja a quien se arrepiente y que la conciliación muestre "qué devoluciones quedaron pendientes" ([10-features.md](../10-features.md)). La decisión abierta 11 preguntaba si POLENTA devuelve el dinero cuando alguien se baja después de pagar, y si cambia con el sorteo hecho. La respuesta del organizador no llegó.

[07-configurabilidad.md](../07-configurabilidad.md) §2.5 ya decía que el movimiento de dinero queda fuera del sistema y que devolver o no es regla del circuito, no de la plataforma. El schema tenía `Pago.requiereDevolucion` y `devueltoEn` desde el principio, sin uso.

## Opciones consideradas

1. **El sistema anota, en cada baja, si corresponde la devolución; la devuelve la organización, por fuera.**
   - En contra: la organización decide cada vez, y el sistema no le recuerda una política.
2. **Una política de devolución por torneo** ("se devuelve hasta el sorteo"), que el sistema aplica sola.
   - En contra: hace falta la respuesta de POLENTA para saber qué política, y otro parámetro en Nuevo torneo. Una lesión o un viaje son casos que el Comité resuelve uno por uno.
3. **Devolver por MercadoPago desde el sistema.**
   - En contra: la plata entra a la cuenta de la plataforma ([05-pagos.md](../05-pagos.md) §2), los pagos en efectivo no pasan por MercadoPago, y sería una operación de dinero que el alcance dejó afuera.

## Decisión

Opción 1, elegida por el grupo.

- **Dar de baja a quien pagó** abre, debajo de la fila, la pregunta: ¿le corresponde que se lo devuelvas? Ninguna opción viene marcada, porque lo decide el reglamento de cada circuito en cada caso. Con un pago de 0 no se pregunta.
- **Se guarda en `Pago.requiereDevolucion`.** La inscripción pasa a `CANCELADA` y el pago sigue aprobado: la plata entró.
- **"Ya se lo devolví"** marca `devueltoEn` y pasa el pago a `DEVUELTO`. Está en la tarjeta Devoluciones y en la pestaña Bajas.
- **La conciliación dice aparte lo que hay que devolver**, sin restarlo de lo que le corresponde a la organización: la devolución la hace ella, con su plata ([decisión 078](078-comision-de-la-plataforma.md)).

## Por qué

- **No inventa una regla que el reglamento no tiene**, ni espera una respuesta que puede no llegar antes de la entrega.
- **Es lo que ya decía 07 §2.5:** la plataforma registra, la organización mueve la plata.
- **Lo que hoy se pierde entre mensajes queda escrito:** a quién hay que devolverle y si ya se hizo.

## Qué se resigna

- **No hay una política automática.** Si un circuito siempre devuelve hasta el sorteo, igual tiene que elegirlo en cada baja.
- **El sistema no verifica la devolución:** confía en que la organización la marque cuando la hace.
- **No se puede volver a inscribir a mano a quien se dio de baja** después de pagar: una inscripción tiene un solo pago, y pisarlo borraría de la conciliación lo que se cobró.
