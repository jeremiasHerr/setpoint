# Pagos

## 1. Qué se cobra

**Solo la inscripción del jugador al torneo.** La organización no paga por publicar.

Importe actual en POLENTA: **$45.000 ARS**, que incluye tubo de pelotas, canchas de las eliminatorias, asado de cierre y premios.

**Medio actual:** transferencia bancaria, con envío manual del comprobante y verificación a mano. La plataforma reemplaza ese circuito completo.

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

1. El jugador toca "inscribirme"
2. **Se crea la `Inscripcion` en `pendiente_pago` ANTES de ir a MercadoPago**, con reserva de cupo por 15 minutos
3. El backend crea la preferencia con `external_reference = inscripcion.id`
4. La app abre el `init_point` con `expo-web-browser`
5. El jugador paga
6. MercadoPago redirige a una URL https propia, que redirige al deep link `torneosapp://inscripcion/:id`
7. La app muestra "confirmando pago…" y hace polling a `GET /inscripciones/:id`
8. **El webhook** llega a `POST /webhooks/mercadopago`, el backend consulta el pago contra la API de MP y, si está `approved`, pasa la inscripción a `pagada`
9. El polling devuelve `pagada` y la pantalla cambia a "inscripto"

---

## 4. Reglas no negociables

- **La confirmación viene del webhook, nunca del redirect.** El redirect puede llegar antes de que el pago esté acreditado
- **El webhook consulta el pago contra la API de MercadoPago.** No se confía en el payload recibido
- **El webhook es idempotente.** MP reenvía notificaciones; si la inscripción ya está `pagada`, se responde 200 y no se hace nada
- **El cupo se reserva antes de pagar,** con vencimiento a 15 minutos, para evitar sobreventa

> El "confirmando pago…" con polling no es un parche: es la forma correcta de manejar una confirmación asincrónica.

---

## 5. Estados de la inscripción

```
pendiente_pago → pagada
              → expirada      (venció la reserva de 15 min)
              → rechazada     (MercadoPago rechazó el pago)
              → cancelada     (baja del jugador o de la organización)

en_lista_espera → pendiente_pago   (se liberó un cupo)
```

Un job periódico expira las reservas vencidas, libera el cupo y **notifica al primero de la lista de espera**.

---

## 6. Lista de espera

Regla tomada del reglamento ([02](02-dominio.md) §11): quienes quedan fuera del cupo se ordenan **por orden de llegada** y cubren deserciones.

También aplica al cierre de inscripciones: si hay inscriptos que no pagaron, se los consulta con un plazo y, si no cumplen, se pasa al siguiente de la lista.

Hoy esto se lleva a mano. Modelarlo es una mejora directa sobre el proceso actual.

---

## 7. Inscripción manual

La organización puede inscribir a alguien que pagó por fuera del sistema — efectivo o transferencia — sin pasar por MercadoPago. La inscripción queda `pagada` con `medio_pago = manual`, y se refleja en la conciliación del torneo.

Necesario durante la transición: no todos los jugadores van a adoptar el pago digital de entrada.
