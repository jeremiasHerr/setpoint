# 007 — Qué parte de la vinculación de cuentas entra en F02

**Estado:** aceptada — 5 de octubre de 2026

## Contexto

F02 ([10-features.md](../10-features.md)) incluye: *"Cuando un jugador crea su cuenta, el sistema le ofrece vincularla con su perfil del padrón. La organización puede revisar y revertir esas vinculaciones."*

Pero las cuentas de jugador todavía no existen. Según [04-flujo-jugador.md](../04-flujo-jugador.md) §4 y la pantalla [cuenta-e-ingreso.html](../pantallas/jugador/cuenta-e-ingreso.html), la cuenta nace **después de pagar la inscripción**, en la app móvil. Eso es F12, de la entrega del 75%. Además, el identificador del jugador (DNI o email) sigue siendo la decisión abierta 8 del [README](../README.md).

El resto de F02 (alta, edición, categoría, baja) ya estaba hecho. Había que decidir qué se hace ahora con la vinculación.

## Opciones consideradas

1. **Solo el lado de la organización.** El padrón muestra qué perfiles tienen cuenta vinculada y permite desvincularlas.
   - En contra: hasta que exista F12 nadie puede vincular una cuenta, así que solo se prueba con el seed. La pantalla de referencia del padrón no muestra ese detalle.
2. **La vinculación completa ahora**, incluido el endpoint para que el jugador cree su cuenta y elija su perfil.
   - En contra: adelanta parte de F12 sin la inscripción ni el pago de los que depende, en una pantalla móvil del 75%, y obliga a cerrar antes de tiempo la decisión abierta 8.
3. **Mover la vinculación a F12** y no programar nada.
   - En contra: cambia la planilla de features que la cátedra ya vio, y la revisión de la organización quedaría para la última entrega.

## Decisión

Opción 1.

- `JugadorPadron` incluye `cuenta` (nombre y email de quien reclamó el perfil, o `null`).
- `DELETE /api/organizaciones/:slug/jugadores/:id/cuenta` desvincula: pone `Jugador.usuarioId` en `null`.
- En el padrón, la fila muestra "con cuenta" y el panel de edición permite desvincular.
- El seed crea una cuenta vinculada a un jugador para poder probarlo.

## Por qué

- **Es la red de seguridad que define 04-flujo-jugador §4:** el caso normal se vincula solo y el caso raro lo corrige la organización a mano. Tenerla antes de que existan las cuentas garantiza que F12 no salga sin ella.
- **No depende de nada abierto.** Desvincular es poner un campo en `null`. Funciona igual se identifique al jugador por DNI o por email.
- **Es barato y no se tira.** Cuando llegue F12, solo falta el lado del jugador.

## Qué se resigna

- **F02 no queda completa en esta entrega.** La creación de la cuenta y la elección del perfil quedan para F12.
- **Una funcionalidad que en la demo del 25% solo se ve con datos del seed.**
- **Desvincular no avisa al jugador.** Su cuenta sigue existiendo y puede volver a vincularse. Si hiciera falta un aviso, va con las notificaciones de F11.
