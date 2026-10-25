# 054 — Perfil pendiente y la persona que todavía no juega en ningún circuito

**Estado:** aceptada — 25 de octubre de 2026. Ajusta la [decisión 051](051-vinculacion-con-el-padron.md) en lo que dice de los flujos abandonados, y la [decisión 039](039-ingreso-del-jugador.md) en lo que ve en la app quien no tiene perfil. Implementada en la API; la web y la app, en los PRs siguientes.

## Contexto

En los torneos con aprobación y abiertos ([07-configurabilidad.md](../07-configurabilidad.md) §2.6), quien se inscribe no está en el padrón: no hay un `Jugador` que elegir. Pero la inscripción necesita uno, porque `Inscripcion.jugadorId` es obligatorio, y todo lo que viene después (el cupo, la unicidad por torneo y jugador, el sorteo, la tabla de inscriptos) supone que lo hay. La decisión 051 lo dejó para decidir al implementar.

La otra mitad del problema es la app. Con el ingreso sin contraseña ([decisión 049](049-identidad-e-ingreso-con-codigo.md)), quien verificó su email ya tiene cuenta, aunque su inscripción esté en revisión o sin pagar. Hasta ahora, la app rechazaba el ingreso de alguien sin perfiles de jugador.

## Opciones consideradas

### Dónde vive quien se inscribe sin estar en el padrón

1. **Un `Jugador` pendiente**, creado con la solicitud o con la reserva, que entra al padrón al pagar.
   - En contra: el perfil existe antes de ser del padrón, y hay que dejarlo afuera en cada consulta del padrón, el ranking, la búsqueda, el sorteo y las vistas públicas.
2. **`Inscripcion.jugadorId` opcional hasta el pago**, con nombre y apellido guardados en la inscripción.
   - En contra: toca todo lo que supone que hay un jugador, incluida la unicidad por torneo y jugador, y suma chequeos de null en todo el motor de competencia.
3. **Un modelo `Solicitud` aparte** para los torneos con aprobación; al aprobarla se crea el perfil.
   - En contra: no resuelve el torneo abierto, que necesita reservar el cupo antes de pagar, así que igual hay que elegir entre 1 y 2.

### Qué pasa con el perfil si se abandona

1. **Se borra** cuando vence la reserva o se rechaza la solicitud.
   - En contra: la inscripción se queda sin jugador, las claves foráneas se rompen y se pierde el historial.
2. **Se descarta:** queda en la base, fuera del padrón.
   - En contra: los descartados se acumulan. Limpiarlos, si hace falta, es un proceso aparte.

### Qué ve en la app quien todavía no juega en ningún circuito

1. **Un error en el ingreso**, como hasta ahora.
   - En contra: quien tiene una solicitud en revisión o un lugar sin pagar no tiene dónde ver en qué quedó.
2. **El perfil pendiente como un circuito más.**
   - En contra: entraría a pestañas (Cuándo juego, Mi zona, Ranking) de un circuito en el que todavía no juega, y que puede no aprobarlo.
3. **Entra, y ve sus inscripciones en curso** en una pantalla propia. Si ya juega en otro circuito, van como aviso arriba de Cuándo juego.
   - En contra: una pantalla más en la app, y la app tiene que volver a pedir la cuenta para enterarse de los cambios.

### Cómo se avisa una solicitud no aprobada o una reserva vencida

1. **Se recuerda en el celular** qué avisos ya se vieron.
   - En contra: en otro celular el aviso aparece otra vez.
2. **Un campo `avisoVistoEn` en la inscripción.**
   - En contra: una columna y una ruta más para algo que es del dispositivo.

## Decisión

### El perfil pendiente

Opción 1, y el perfil abandonado se descarta.

- **`Jugador.estado`:** `PADRON`, `PENDIENTE` o `DESCARTADO`. Todo el padrón existente es `PADRON`.
- **El filtro vive en un solo lugar**, `apps/api/src/lib/padron.ts`. `DEL_PADRON` es lo que ve la organización en su padrón (con los dados de baja), y `DEL_PADRON_ACTIVOS`, lo que usan el ranking, la búsqueda, el sorteo, el link personal, los perfiles de la cuenta y las vistas públicas.
- **Con aprobación**, la solicitud es una `Inscripcion` en `SOLICITADA`, con su perfil pendiente, y no ocupa lugar. Al aprobarla pasa a `APROBADA` y le llega un email con el link para pagar. La reserva corre desde que abre ese link. Al rechazarla pasa a `NO_APROBADA`, sin explicación (02-dominio §2), y el perfil se descarta.
- **Abierto**, el perfil pendiente se crea con la reserva del lugar, como cualquier otra.
- **El perfil entra al padrón al confirmarse el pago**, con 0 puntos.
- **Se descarta, no se borra,** si vence la reserva, se rechaza el pago o se rechaza la solicitud. Al descartarlo se suelta la cuenta (`usuarioId` en null): la inscripción la conserva en su propio `usuarioId`, así que queda el historial, y el descartado no le impide a la persona volver a inscribirse ni a la organización vincularla después.
- **Una solicitud aprobada que no se paga a tiempo vuelve a "aprobada"**, y puede volver a abrir el link mientras la inscripción siga abierta y queden lugares. **Al cerrar la inscripción**, la solicitud que nadie aprobó pasa a `NO_APROBADA` y la aprobada sin pagar vence; las dos descartan su perfil. Las reservas vigentes no se tocan ([decisión 024](024-reservas-sin-pagar-al-cerrar.md)).
- **Solo la organización ve los pendientes**, en las solicitudes de la pantalla Inscripciones. Nadie más.
- **Una persona con una inscripción en curso en un circuito** no puede empezar otra ahí hasta que se resuelva: tiene un solo perfil por organización (decisión 051), y el pendiente lo ocupa.

### La persona que todavía no juega en ningún circuito

Opción 3, y los avisos se recuerdan en el celular.

- **La cuenta (`Usuario`) se crea al verificar el código, no al pagar.** Quien verificó su email es una persona válida aunque todavía no juegue en ningún circuito.
- **El perfil pendiente no es un circuito:** no aparece en la lista de circuitos de la [decisión 040](040-jugador-en-varios-circuitos.md) ni da permiso a las rutas del jugador ([decisión 044](044-rutas-del-jugador.md)).
- **`GET /api/auth/cuenta`** devuelve los circuitos, las inscripciones en curso (solicitud en revisión, aprobada sin pagar, reserva sin pagar) y los avisos de los últimos 30 días (solicitud no aprobada, reserva vencida). La app la pide al abrirse y al volver al frente, porque los perfiles ya no le llegan solo al ingresar.
- **Sin circuitos**, la app abre en *Inscripciones en curso* ([pantalla de referencia](../pantallas/jugador/inscripciones-en-curso.html)). Sin circuitos ni inscripciones en curso: *"Todavía no jugás en ningún circuito. Inscribite desde el link que comparte tu organización"*.
- **Si ya juega en otro circuito**, entra a ese como siempre, y las inscripciones en curso van como aviso arriba de Cuándo juego.
- **Al confirmarse el pago**, el perfil entra al padrón y aparece como circuito la próxima vez que la app pide la cuenta.
- **"Pagar" desde la app** inicia el pago con la sesión de la app y abre el checkout con el sistema (`Linking.openURL`), no con un navegador dentro de la app: así Android puede abrir la app de MercadoPago si está instalada, y si no, el navegador. La confirmación llega por el webhook, como siempre, y la app la ve al volver al frente. Sin credenciales de MercadoPago, la app muestra el pago simulado ([decisión 053](053-pago-sin-credenciales.md)).

## Por qué

- **Todo lo que viene después de la inscripción sigue igual.** Con un jugador siempre presente, el cupo, el sorteo, la tabla de inscriptos y la unicidad por torneo y jugador no cambian; la diferencia queda en un filtro.
- **Un solo lugar para el filtro** hace que no se pueda olvidar en una consulta nueva sin que se note: quien escribe una consulta del padrón usa la constante. Lo cubre un test contra la base.
- **Descartar en vez de borrar** mantiene las claves foráneas y el historial: la organización puede ver que alguien pidió entrar y no se aprobó.
- **Que la reserva de una aprobada vuelva a "aprobada"** evita que la organización tenga que aprobar dos veces a alguien que no llegó a pagar en 15 minutos.
- **La cuenta al verificar el código** es lo que ya hace el ingreso sin contraseña: el email verificado es la persona. Rechazarla en la app solo porque no juega todavía la dejaba sin dónde ver en qué quedó su inscripción.
- **El perfil pendiente no es un circuito** porque la organización todavía puede no aprobarlo: entrar a sus pestañas mostraría un circuito en el que no juega.
- **Los avisos en el celular** son una comodidad del dispositivo; verlos dos veces en dos celulares no rompe nada, y no hace falta una columna.

## Qué se resigna

- **Ajusta la decisión 051**, que decía que un flujo abandonado no deja nada. Ahora el perfil existe desde la reserva o la solicitud, pero nunca es visible salvo para la organización, y si se abandona queda descartado.
- **Los descartados se acumulan.** Limpiar los viejos, si hace falta, es un proceso aparte.
- **Una aprobada que vuelve a "aprobada" no ocupa lugar**: si se llenó el cupo mientras tanto, ya no puede pagar.
- **El aviso de una solicitud no aprobada o una reserva vencida** puede aparecer otra vez en otro celular.
- **"Pagar" desde la app** depende de que la app de MercadoPago tome el link del checkout. Si no, abre el navegador. Con credenciales de prueba, el checkout es siempre web.
