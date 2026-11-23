# 137 — Cada organización cobra con su MercadoPago

**Estado:** aceptada — 23 de noviembre de 2026. Resuelve la mitad de la decisión abierta 19 (cobrar el cargo por jugador sigue abierto) y reemplaza el modelo de cuenta única de [05-pagos.md](../05-pagos.md) §2.

## Contexto

Hasta ahora toda la plata de las inscripciones entraba a una sola cuenta de MercadoPago, la de Setpoint, que después le pasaba a cada organización lo suyo por fuera del sistema ([05-pagos.md](../05-pagos.md) §2). Se eligió así por alcance: conectar la cuenta de cada organización parecía de 3 a 5 días, en un área con documentación floja. Se dejó preparada la tabla `CuentaCobro`.

Fuera de la demo, el grupo no acepta que la plata pase por Setpoint (decisión abierta 19). Además, al revisar la versión publicada, Railway no tenía ningún token de MercadoPago, así que setpoint.com.ar no podía cobrar nada.

## Opciones consideradas

**Cómo conecta la organización su cuenta**

1. **OAuth de MercadoPago:** la organización toca "Conectar MercadoPago", autoriza a Setpoint en MercadoPago y vuelve. Es lo que hacen las plataformas.
   - En contra: registrar la aplicación con una URL de vuelta, renovar los tokens, cuidar que la organización desconecte, y probar con dos cuentas de prueba.
2. **La organización pega su credencial** en Tu circuito.
   - En contra: el organizador tiene que entrar al panel de desarrolladores y crear una aplicación, y Setpoint guarda una credencial con acceso total a su cuenta.
3. **Seguir con la cuenta única** hasta después de la entrega.
   - En contra: la versión publicada no le sirve a un circuito real para cobrar.

**Qué pasa con un torneo con importe si la organización no conectó MercadoPago**

1. Se publica igual, y la organización inscribe a mano a quien le paga.
   - En contra: vuelve la verificación a mano.
2. **No se publica: sin cuenta, solo torneos gratis.**
   - En contra: quien cobra en efectivo tiene que conectar MercadoPago igual, o publicarlo gratis y controlar a mano quién pagó.
3. Se cobra con la cuenta de Setpoint.
   - En contra: es lo que el grupo no acepta.

**Cómo se guardan los tokens**

1. **Cifrados por la API**, con una clave que vive en una variable de entorno.
   - En contra: si se pierde la clave, todas las organizaciones tienen que volver a conectarse.
2. En texto plano, confiando en el cifrado del proveedor de la base.
   - En contra: con la base sola se puede cobrar y ver los pagos de todas las organizaciones.

## Decisión

OAuth, sin cuenta solo torneos gratis, y tokens cifrados. Las tres las eligió el grupo.

- **Conectar** (`POST /api/organizaciones/:slug/mercadopago`) devuelve el link de autorización, con un `state` aleatorio y PKCE (S256). El `state` y el verificador quedan en `CuentaCobro` hasta la vuelta, 30 minutos como mucho, y sirven una sola vez.
- **La vuelta** (`GET /api/mercadopago/vuelta`, la URL de redireccionamiento de la aplicación) no pide login: la sesión de la web vive en el navegador y no viaja en la redirección. El `state` dice de qué organización es. La API canjea el código, guarda los tokens, lee el nombre de la cuenta para mostrarlo y redirige a Tu circuito con `?mercadopago=conectada` o el motivo por el que no se conectó.
- **Los tokens se guardan cifrados** con AES-256-GCM y `CLAVE_TOKENS_MERCADOPAGO`.
- **Cada cobro se crea con el token de la organización del torneo**, y la URL del aviso lleva `?organizacion=<id>`: el webhook consulta el pago con esa cuenta y verifica que la inscripción sea de esa organización.
- **Publicar un torneo con importe pide una cuenta conectada**, y también pasar a cobrar uno publicado. Si no, la API responde `SIN_MERCADOPAGO` con el campo `precio`. Un torneo publicado antes, o el de una organización que desconectó su cuenta, responde lo mismo al intentar pagar.
- **Desconectar** (`DELETE`) borra los tokens, salvo que haya pagos en curso: inscripciones reservando que ya abrieron el checkout. Sin la cuenta que los cobró no habría con qué consultarlos. Por lo mismo, no se puede conectar otra cuenta mientras haya pagos en curso con la anterior.
- **Los tokens se renuevan solos** con una tarea cada 12 horas, un mes antes de vencer (duran 180 días). Si MercadoPago rechaza la renovación, la organización le sacó el permiso a Setpoint: la cuenta queda desconectada y Tu circuito ofrece volver a conectarla.
- **`MERCADOPAGO_PRUEBA=1`** pide credenciales de prueba al conectar (`test_token`): el checkout es el del sandbox, aunque quien conecte sea una cuenta real. Es solo para desarrollo: **la versión publicada cobra de verdad desde el primer día**, porque la idea es compartirla con circuitos reales cuanto antes.
- **Setpoint no cobra una comisión en cada pago** (`marketplace_fee`): su cargo sigue siendo por jugador, al cerrar la inscripción ([decisión 103](103-cargo-por-jugador-inscripto.md)).

## Por qué

- **La plata le llega a la organización sin pasar por nadie.** Desaparece la transferencia por fuera que hacía Setpoint, y con ella la responsabilidad de tener plata ajena.
- **OAuth no le pide al organizador nada técnico:** inicia sesión en MercadoPago y autoriza, como en cualquier plataforma. Y la organización puede sacarle el permiso a Setpoint desde su cuenta.
- **Publicar con importe sin cuenta dejaba un torneo que nadie podía pagar.** Con la regla, el error aparece al publicar, donde la organización lo puede resolver, y no cuando el jugador toca "Pagar".
- **La base sola no alcanza para cobrar en nombre de nadie,** y el cifrado es una función chica sin dependencias.
- **El resto del pago no cambia:** la reserva, el webhook idempotente, el comprobante y la lista de espera son los mismos; solo cambia con qué token se habla con MercadoPago.

## Qué se resigna

- **Hacen falta tres variables más en el deploy** (`MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET`, `CLAVE_TOKENS_MERCADOPAGO`) y la URL de redireccionamiento cargada en la aplicación de MercadoPago.
- **Si se pierde `CLAVE_TOKENS_MERCADOPAGO`,** todas las organizaciones tienen que volver a conectar su cuenta.
- **Un pago que MercadoPago avisa después de desconectar la cuenta** no se confirma solo: la organización lo inscribe a mano. Con el pago resuelto en el momento ([decisión 139](139-el-pago-se-resuelve-en-el-momento.md)) es raro, porque no se puede desconectar con pagos en curso.
- **Quien cobra en efectivo tiene que conectar MercadoPago igual,** o publicar gratis y controlar a mano quién pagó.
- **La conexión real no se prueba con `docker compose up`:** necesita la aplicación de MercadoPago y una URL pública. La entrega sigue con el pago simulado ([decisión 138](138-el-pago-simulado-se-activa-a-proposito.md)).
- **Qué llega a la vuelta si la organización rechaza la autorización** no lo dice la documentación de MercadoPago. Se trata como cancelada si no hay código.
