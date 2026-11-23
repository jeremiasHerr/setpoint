# Pagos

## 1. Qué se cobra

**Solo la inscripción del jugador al torneo.** La organización no paga por publicar.

El importe lo fija cada torneo. En el caso de validación (POLENTA): **$45.000 ARS**, que incluye tubo de pelotas, canchas de las eliminatorias, asado de cierre y premios.

**Medio habitual hoy:** transferencia bancaria, con envío manual del comprobante y verificación a mano. Es lo que hace POLENTA y la mayoría de los circuitos amateur. La plataforma reemplaza ese circuito completo.

---

## 2. Modelo elegido: cada organización cobra con su cuenta

**La plata de cada inscripción entra directo a la cuenta de MercadoPago de la organización**, sin pasar por Setpoint ([decisión 137](decisiones/137-cada-organizacion-cobra-con-su-mercadopago.md)). La organización conecta su cuenta desde *Tu circuito*, por OAuth: toca "Conectar MercadoPago", inicia sesión en MercadoPago, autoriza a Setpoint y vuelve.

- **Sin cuenta conectada, solo se publican torneos gratis.** Publicar uno con importe, o pasar a cobrar uno publicado, responde `SIN_MERCADOPAGO`.
- **Cada cobro se crea con el token de la organización del torneo**, y el webhook consulta el pago con esa misma cuenta.
- **Los tokens se guardan cifrados** en `CuentaCobro`, con una clave que vive en una variable de entorno (`CLAVE_TOKENS_MERCADOPAGO`), y se renuevan solos antes de vencer.
- **La organización puede desconectar su cuenta**, salvo mientras haya pagos en curso, y puede sacarle el permiso a Setpoint desde MercadoPago.

**Setpoint no se queda con una comisión de lo cobrado:** cobra un cargo fijo por jugador inscripto, que la organización paga al cerrar la inscripción, y el primer torneo es gratis ([decisión 103](decisiones/103-cargo-por-jugador-inscripto.md), que reemplaza el 5% de la [078](decisiones/078-comision-de-la-plataforma.md)). El cargo todavía no se cobra en el sistema. La conciliación se calcula al consultar, con los pagos del torneo: lo cobrado por MercadoPago ya está en la cuenta de la organización, y lo cobrado en efectivo o por transferencia ya lo tiene. La tabla `Liquidacion` del schema no se usa.

> **Antes, la plata entraba a una sola cuenta, la de Setpoint,** que le transfería a cada organización lo suyo por fuera. Se había elegido por alcance: conectar la cuenta de cada organización parecía de 3 a 5 días, en un área con documentación floja. Fuera de la demo no era aceptable para el grupo (era la decisión abierta 19), y la decisión 137 lo reemplazó.

### El pago simulado

Con `PAGO_SIMULADO=1` ningún pago pasa por MercadoPago: la pantalla de pago ofrece aprobarlo o rechazarlo, y se pueden publicar torneos con importe sin cuenta conectada ([decisión 138](decisiones/138-el-pago-simulado-se-activa-a-proposito.md), que reemplaza en parte a la [053](decisiones/053-pago-sin-credenciales.md)). Lo pone el `docker-compose.yml` de la entrega, que no puede depender de cuentas externas. Sin la variable no se simula nunca, falte la credencial que falte.

---

## 3. Flujo de inscripción

> **Estado:** implementado en la API. `POST /api/inscripcion/:slug/inscripciones/:id/pago` crea la preferencia con la cuenta de la organización (con vencimiento igual al de la reserva) y `POST /api/webhooks/mercadopago?organizacion=<id>` confirma o rechaza consultando el pago con esa cuenta. Una tarea vence las reservas cada minuto. Con `PAGO_SIMULADO=1`, el pago es simulado ([decisión 138](decisiones/138-el-pago-simulado-se-activa-a-proposito.md)). Si un pago aprobado llega después de vencida la reserva, se confirma igual: el jugador ya pagó.

Quien llega por el link del torneo se inscribe desde el navegador del celular; quien tiene la sesión iniciada, también desde la app ([04-flujo-jugador.md](04-flujo-jugador.md) §5). En los dos casos, antes de pagar ya verificó su email con un código: **el código va antes del pago**, para que nadie quede con un pago hecho y una inscripción sin confirmar porque el código no le llegó ([decisión 049](decisiones/049-identidad-e-ingreso-con-codigo.md)).

1. El jugador verifica su email, encuentra su perfil (04 §5.5 y §5.6) y toca "Pagar"
2. **Se crea la `Inscripcion` en `pendiente_pago` ANTES de ir a MercadoPago**, con reserva de cupo por 15 minutos. El perfil elegido queda reservado y la vinculación con la persona, pendiente hasta el pago ([decisión 051](decisiones/051-vinculacion-con-el-padron.md))
3. El backend crea la preferencia con el token de la organización y `external_reference = inscripcion.id`
4. La web redirige al `init_point`; la app lo abre con el sistema (`Linking.openURL`), para que Android pueda abrir la app de MercadoPago si está instalada ([decisión 054](decisiones/054-perfil-pendiente.md))
5. El jugador paga
6. MercadoPago redirige a la página de la inscripción en la web. Desde la app no hace falta volver por un link: al volver al frente, la app pide de nuevo la cuenta y ve si se confirmó
7. La pantalla muestra "Confirmando el pago" y consulta el estado cada unos segundos, con la sesión que dejó el código
8. **El webhook** llega a `POST /webhooks/mercadopago`, el backend consulta el pago contra la API de MP con la cuenta de la organización y, si está `approved`, pasa la inscripción a `pagada`, guarda la vinculación del perfil con la persona y manda el comprobante por email (§4)
9. La consulta devuelve `pagada` y la pantalla cambia a "Listo, estás inscripto", con el número de inscripción y el email al que se mandó el comprobante

---

## 4. Comprobante por email

**Se manda cuando el webhook confirma el pago**, en la misma transición de `pendiente_pago` a `pagada`. Nunca en la vuelta del checkout: el redirect puede llegar antes de que el pago se acredite, o de un pago que después se rechaza, y el jugador recibiría un comprobante de algo que no pagó.

| Lleva | Ejemplo |
|---|---|
| Jugador | Lucas Bravo |
| Torneo y categoría | Primavera 26 · Tercera |
| Monto | $45.000 |
| Número de inscripción | 100482 |
| Fecha del pago | sábado 20 de septiembre |
| Link al torneo | La página pública de la edición |
| Al pie | Que en la app entra con el mismo email y un código |

- **El número de inscripción** es el id de la `Inscripcion`. Se muestra también en la pantalla final, como respaldo si el email se demora o cae en spam, y con él la organización la encuentra.
- **Va al email verificado de la persona.** No hay cuenta que crear ni contraseña: la cuenta es ese email ([decisión 049](decisiones/049-identidad-e-ingreso-con-codigo.md)).
- **Es idempotente, como el webhook.** Si MercadoPago reenvía la notificación y la inscripción ya está `pagada`, no sale otro comprobante.
- **Se envía con `apps/api/src/lib/correo.ts`**, el mismo de los códigos y de la recuperación de la contraseña de los administradores. Para la entrega, Mailpit lo atrapa y lo muestra en `http://localhost:8025` ([decisión 006](decisiones/006-recuperar-la-contrasena.md)); la versión publicada lo manda con Resend ([decisión 086](decisiones/086-version-publicada.md)).

---

## 5. Reglas no negociables

- **La confirmación viene del webhook, nunca del redirect.** El redirect puede llegar antes de que el pago esté acreditado
- **El webhook consulta el pago contra la API de MercadoPago,** con la cuenta de la organización que dice la URL del aviso, y verifica que la inscripción sea de esa organización. No se confía en el payload recibido
- **El webhook es idempotente.** MP reenvía notificaciones; si la inscripción ya está `pagada`, se responde 200 y no se hace nada
- **El cupo se reserva antes de pagar,** con vencimiento a 15 minutos, para evitar sobreventa
- **El pago se resuelve en el momento,** sin Rapipago, Pago Fácil ni cajeros (`binary_mode`, [decisión 139](decisiones/139-el-pago-se-resuelve-en-el-momento.md)). Un pago en efectivo se acreditaría días después, con la reserva vencida y el lugar dado a otro. Quien quiere pagar en efectivo le paga a la organización, que lo inscribe a mano (§8)
- **El comprobante sale con el webhook, nunca con el redirect** (§4)

> El "confirmando pago…" con polling no es un parche: es la forma correcta de manejar una confirmación asincrónica.

---

## 6. Estados de la inscripción

```
pendiente_pago → pagada
              → expirada      (venció la reserva de 15 min)
              → rechazada     (MercadoPago rechazó el pago)
              → cancelada     (baja del jugador o de la organización)

solicitada → aprobada       (la organización la aprobó; no ocupa lugar)
           → no_aprobada    (la rechazó, o cerró la inscripción sin aprobarla)
aprobada   → pendiente_pago (abrió el link para pagar: corre la reserva)
           → expirada       (cerró la inscripción sin que pagara)
pendiente_pago de una aprobada → aprobada (venció la reserva: puede volver a abrir el link)

pagada → cancelada   (baja de la organización, hasta el sorteo; el pago sigue aprobado y se anota si corresponde devolución)

(nueva)         → en_lista_espera  (el cupo estaba lleno: se anotó desde el link, sin pagar)
en_lista_espera → pendiente_pago   (se liberó un cupo: reserva de 24 horas desde el aviso)
```

Quien sigue en `en_lista_espera` cuando se confirma el sorteo no cambia de estado: la pantalla muestra que la lista terminó, calculado con el sorteo del torneo ([decisión 082](decisiones/082-la-lista-termina-con-el-sorteo.md)).

Un job periódico expira las reservas vencidas, libera el cupo y **notifica al primero de la lista de espera**, que lo tiene reservado 24 horas ([decisión 076](decisiones/076-lista-de-espera-24-horas.md)). Al expirar, también se descarta la vinculación pendiente, y el perfil vuelve a aparecer en la búsqueda ([decisión 051](decisiones/051-vinculacion-con-el-padron.md)). Si el perfil era pendiente (alguien que no estaba en el padrón), queda descartado ([decisión 054](decisiones/054-perfil-pendiente.md)); lo mismo al rechazarse el pago.

**Solicitudes** (torneos `con_aprobacion`, [decisión 054](decisiones/054-perfil-pendiente.md)). Quien no está en el padrón deja una solicitud (`solicitada`), con un perfil pendiente, que no reserva lugar ni cobra. Si la organización la aprueba, recibe un email con el link para pagar: al abrirlo (con la sesión, o con un código si lo abre en otro navegador) y tocar "Reservar y pagar", la inscripción pasa a `pendiente_pago`, con la reserva de siempre (`POST /api/inscripcion/:slug/inscripciones/:id/reservar`). Entra al padrón al confirmarse el pago.

---

## 7. Lista de espera

Si el torneo tiene lista de espera (parámetro del torneo, [07](07-configurabilidad.md) §2.6), quienes quedan fuera del cupo se ordenan **por orden de llegada** y cubren deserciones. Es la regla del reglamento de POLENTA ([02](02-dominio.md) §11) y la habitual.

También aplica al cierre de inscripciones: si hay inscriptos que no pagaron, se los consulta con un plazo y, si no cumplen, se pasa al siguiente de la lista.

Hoy esto se lleva a mano. Modelarlo es una mejora directa sobre el proceso actual.

**Cómo se anota** ([decisión 081](decisiones/081-anotarse-en-la-lista-de-espera.md)). Con el cupo lleno, el link del torneo ofrece "Anotarme en la lista de espera" y sigue el mismo camino que la inscripción: el email, el código y el perfil. Al final no se cobra nada (`POST /api/inscripcion/:slug/torneos/:id/lista-de-espera`). Se anota quien tiene perfil en el padrón; el perfil queda apartado mientras espera y se vincula al pagar, como en una reserva.

**Cómo funciona** ([decisión 076](decisiones/076-lista-de-espera-24-horas.md)). Cuando se libera un lugar (una baja, una reserva que vence, un pago rechazado o un cupo más grande), el primero de la lista pasa a `pendiente_pago` con una reserva de 24 horas desde el aviso, y le llega un email con el link para pagar. Si no paga, la reserva vence y el lugar pasa al siguiente. Las horas están en el torneo (`horasReservaListaEspera`). La lista termina cuando se confirma el sorteo ([decisión 077](decisiones/077-baja-hasta-el-sorteo.md)).

**Las bajas** ([decisión 075](decisiones/075-la-devolucion-se-anota.md)). La organización da de baja a quien pagó y dice si le corresponde la devolución. El sistema lo anota en `Pago.requiereDevolucion`; la devolución la hace la organización, por fuera, y la marca como hecha (`devueltoEn`, estado `devuelto`).

---

## 8. Inscripción manual

La organización puede inscribir a alguien que pagó por fuera del sistema — efectivo o transferencia — sin pasar por MercadoPago. La inscripción queda `pagada` con el medio que eligió (efectivo, transferencia u otro) y el monto que cobró, y se refleja en la conciliación del torneo como cobrado por fuera. Si estaba reservando, se confirma su reserva; si no, necesita un lugar libre: no se puede pasar del cupo ([decisión 079](decisiones/079-inscribir-a-mano-sin-pasarse-del-cupo.md)).

Necesario durante la transición: no todos los jugadores van a adoptar el pago digital de entrada.
