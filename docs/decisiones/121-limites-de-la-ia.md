# 121 — Límites de las llamadas a la IA

**Estado:** aceptada — 21 de noviembre de 2026.

*Tomada durante la implementación: revisar*

## Contexto

[06-ia.md](../06-ia.md) promete que las llamadas al modelo van "con rate limiting por usuario y tope de gasto", y no estaba hecho. Hoy son dos funcionalidades que llaman al modelo: la importación de la planilla (F03) y los resultados desde los mensajes (F19). Un administrador, o un script con su token, podía subir planillas o pegar chats sin límite, y el gasto va a la cuenta de Setpoint. La [decisión 052](052-limite-de-pedidos.md) ya había resuelto el mismo problema para los códigos de ingreso.

## Opciones consideradas

1. **Una tabla `UsoIA` con una fila por pedido, y `express-rate-limit` por usuario como segunda capa**, como la 052.
   - En contra: una tabla y una migración más.
2. **Solo `express-rate-limit` en memoria.**
   - En contra: no sabe de tokens, así que no hay tope de gasto, y se reinicia con la API.
3. **Sumar los tokens que ya guardan `ImportacionPadron` y `ExtraccionResultado` en su JSON.**
   - En contra: no se puede consultar sin leer cada fila, y un pedido que falla o se descarta no queda contado.

## Decisión

Opción 1.

- **`UsoIA`**: una fila por pedido (una subida de planilla, aunque sean varios archivos, o una lectura de mensajes, aunque reintente), con la organización, el usuario, la funcionalidad y los tokens de entrada y salida que devolvió la respuesta del modelo. La fila se crea antes de llamar al modelo, con 0 tokens, y se completa después.
- **Por usuario, en la base:** 10 pedidos por hora (`IA_PEDIDOS_POR_HORA`). Pasado, `429 LIMITE_DE_PEDIDOS_IA`.
- **Por organización, en la base:** US$ 2 en las últimas 24 horas (`IA_TOPE_DIARIO_USD`), con el precio por millón de tokens también en variables (`IA_PRECIO_ENTRADA_USD_MTOK`, `IA_PRECIO_SALIDA_USD_MTOK`; los de Haiku 4.5). Pasado, `429 TOPE_DE_GASTO_IA`. *Reemplazado en parte por la [decisión 142](142-los-mensajes-con-sonnet.md): los precios están en el código, uno por modelo, y el gasto se suma por funcionalidad con el precio de la suya.*
- **Por usuario, en memoria:** 6 pedidos cada 15 minutos (`middleware/limite.ts`), segunda capa contra ráfagas.
- Las dos funcionalidades comparten el contador y el tope: son el mismo gasto.
- **Sin `ANTHROPIC_API_KEY` no se cuenta ni se limita nada**: no se llama a ningún modelo y todo sigue como antes.
- La web muestra cada código con su aviso de error, sin pantallas nuevas.

## Por qué

- **Los límites que cuidan la plata sobreviven a un reinicio**, porque están en la base. La capa en memoria solo ahorra consultas ante una ráfaga.
- **Se cuenta con los tokens reales**, no con una estimación por tamaño del archivo: es lo que cobra el proveedor.
- **Los valores alcanzan para la demo y para POLENTA**: una planilla de 77 jugadores cuesta unos US$ 0,06, así que US$ 2 por día son decenas de pruebas, y 10 pedidos por hora no molestan a quien trabaja normal.
- **Se limita por pedido y no por llamada**: el reintento es un detalle interno que el usuario no ve.

## Qué se resigna

- **El gasto se conoce después de la respuesta.** Pedidos simultáneos que arrancan antes de que termine el primero pueden pasarse un poco del tope; el límite de pedidos acota cuánto.
- **Un pedido que falla igual cuenta** para el límite de pedidos, aunque gaste 0 tokens.
- **Con varias instancias**, la capa en memoria es por instancia, como en la 052. La de la base no.
- **El tope es por organización y no por plataforma:** muchas organizaciones juntas podrían pasar un gasto total que no está acotado. Un tope global queda para cuando haya más de un circuito real.
- **Los precios son variables a mano**: si cambia el modelo, hay que actualizarlas.
