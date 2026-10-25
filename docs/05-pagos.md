# Pagos

## 1. Qué se cobra

**Solo la inscripción del jugador al torneo.** La organización no paga por publicar.

El importe lo fija cada torneo. En el caso de validación (POLENTA): **$45.000 ARS**, que incluye tubo de pelotas, canchas de las eliminatorias, asado de cierre y premios.

**Medio habitual hoy:** transferencia bancaria, con envío manual del comprobante y verificación a mano. Es lo que hace POLENTA y la mayoría de los circuitos amateur. La plataforma reemplaza ese circuito completo.

---

## 2. Modelo elegido: cuenta única con liquidación

Toda la recaudación entra a una sola cuenta de MercadoPago (la de la plataforma, en sandbox). El sistema registra por torneo una `Liquidacion` con monto recaudado, comisión, monto correspondiente a la organización y estado.

La transferencia efectiva a la organización queda **fuera del alcance del sistema**.

### Por qué no Marketplace

Marketplace (que la plata vaya directo a la cuenta de cada organización) requiere OAuth con MercadoPago, almacenamiento y refresh de tokens de terceros, manejo de revocación y testeo con dos cuentas de prueba. Son 3 a 5 días de trabajo en un área con documentación floja.

Y en la demo **es indistinguible**: el jugador toca "inscribirme", paga, vuelve inscripto. Lo que sí se ve y sí se valora — reserva con vencimiento, idempotencia del webhook, conciliación por torneo — está en ambos modelos.

Ese tiempo compite contra el motor de zonas, los dos cuadros, la app móvil y la IA.

### Cómo queda abierta la migración

Tres decisiones de diseño desde el inicio:

1. Tabla `CuentaCobro` con `organizacion_id`, `access_token` (nullable), `refresh_token` (nullable) y `tipo` (`plataforma` | `propia`). Hoy todos los torneos apuntan a la única cuenta `plataforma`
2. La creación de preferencias aislada en `crearPreferencia(inscripcion, cuentaCobro)`
3. La `Liquidacion` se modela igual en ambos escenarios

En la defensa: *"la arquitectura soporta ambos modelos; entregamos el de cuenta única por decisión de alcance, y la migración está aislada en una sola función"*.

**Punto de control:** 2 de noviembre. Si el motor de competencia, el tablero y la app están cerrados, se puede evaluar agregar Marketplace.

---

## 3. Flujo de inscripción

Inscribirse y pagar no piden cuenta: quien llega por el link del torneo lo hace desde el navegador del celular, y quien tiene cuenta, también desde la app ([04-flujo-jugador.md](04-flujo-jugador.md) §5).

1. El jugador se identifica con su DNI y su email (04 §5.5 a §5.7) y toca "Pagar"
2. **Se crea la `Inscripcion` en `pendiente_pago` ANTES de ir a MercadoPago**, con reserva de cupo por 15 minutos. El DNI y el email quedan pendientes en la inscripción hasta el pago ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md))
3. El backend crea la preferencia con `external_reference = inscripcion.id`
4. La web redirige al `init_point`; la app lo abre con `expo-web-browser`
5. El jugador paga
6. MercadoPago redirige a una URL https propia: en la web es la página de la inscripción; en la app, redirige al deep link `torneosapp://inscripcion/:id`
7. La pantalla muestra "Confirmando el pago" y consulta el estado cada unos segundos. Sin sesión, la consulta usa un código que no se puede adivinar, no el número de inscripción
8. **El webhook** llega a `POST /webhooks/mercadopago`, el backend consulta el pago contra la API de MP y, si está `approved`, pasa la inscripción a `pagada`, guarda la vinculación del DNI con el perfil y manda el comprobante por email (§4)
9. La consulta devuelve `pagada` y la pantalla cambia a "Listo, estás inscripto", con el número de inscripción y el email (enmascarado) al que se mandó el comprobante

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
| Si no tiene cuenta | El link para crear la contraseña ([decisión 051](decisiones/051-identidad-en-la-cuenta.md)) |
| Al pie | *"¿No te inscribiste vos? Avisale a la organización"*, con su contacto |

- **El número de inscripción** es el id de la `Inscripcion`. Se muestra también en la pantalla final, como respaldo si el email no llega (un email mal escrito no se verifica al inscribirse), y con él la organización la encuentra.
- **Va al email de la inscripción.** Si el jugador cambió el email guardado, al anterior le llega un aviso: así se entera la persona real si alguien se inscribió con su DNI ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md)).
- **Es idempotente, como el webhook.** Si MercadoPago reenvía la notificación y la inscripción ya está `pagada`, no sale otro comprobante.
- **Se envía con `apps/api/src/lib/correo.ts`**, el mismo de la recuperación de la contraseña. Para la entrega, Mailpit lo atrapa y lo muestra en `http://localhost:8025` ([decisión 006](decisiones/006-recuperar-la-contrasena.md)); el proveedor real es la decisión abierta 17 del [README](README.md).

---

## 5. Reglas no negociables

- **La confirmación viene del webhook, nunca del redirect.** El redirect puede llegar antes de que el pago esté acreditado
- **El webhook consulta el pago contra la API de MercadoPago.** No se confía en el payload recibido
- **El webhook es idempotente.** MP reenvía notificaciones; si la inscripción ya está `pagada`, se responde 200 y no se hace nada
- **El cupo se reserva antes de pagar,** con vencimiento a 15 minutos, para evitar sobreventa
- **El comprobante sale con el webhook, nunca con el redirect** (§4)

> El "confirmando pago…" con polling no es un parche: es la forma correcta de manejar una confirmación asincrónica.

---

## 6. Estados de la inscripción

```
pendiente_pago → pagada
              → expirada      (venció la reserva de 15 min)
              → rechazada     (MercadoPago rechazó el pago)
              → cancelada     (baja del jugador o de la organización)

en_lista_espera → pendiente_pago   (se liberó un cupo)
```

Un job periódico expira las reservas vencidas, libera el cupo y **notifica al primero de la lista de espera**. Al expirar, también se descartan el DNI y el email pendientes, y el perfil vuelve a aparecer en la búsqueda ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md)).

**Solicitudes** (torneos `con_aprobacion`, *pendiente de código*). Quien no está en el padrón deja una solicitud, que no reserva lugar ni cobra. Si la organización la aprueba, el jugador entra al padrón y recibe un email con el link para pagar: al abrirlo se crea la inscripción en `pendiente_pago`, con la reserva de siempre. Hace falta un estado nuevo para la solicitud ([decisión 049](decisiones/049-identificacion-en-la-inscripcion.md)).

---

## 7. Lista de espera

Si el torneo tiene lista de espera (parámetro del torneo, [07](07-configurabilidad.md) §2.6), quienes quedan fuera del cupo se ordenan **por orden de llegada** y cubren deserciones. Es la regla del reglamento de POLENTA ([02](02-dominio.md) §11) y la habitual.

También aplica al cierre de inscripciones: si hay inscriptos que no pagaron, se los consulta con un plazo y, si no cumplen, se pasa al siguiente de la lista.

Hoy esto se lleva a mano. Modelarlo es una mejora directa sobre el proceso actual.

---

## 8. Inscripción manual

La organización puede inscribir a alguien que pagó por fuera del sistema — efectivo o transferencia — sin pasar por MercadoPago. La inscripción queda `pagada` con `medio_pago = manual`, y se refleja en la conciliación del torneo.

Necesario durante la transición: no todos los jugadores van a adoptar el pago digital de entrada.
