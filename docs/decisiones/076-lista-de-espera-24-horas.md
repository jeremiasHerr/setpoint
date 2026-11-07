# 076 — Cuando se libera un lugar, el primero de la lista de espera lo tiene reservado 24 horas

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

El reglamento de POLENTA ordena la lista de espera por orden de llegada y la usa para cubrir deserciones ([02-dominio.md](../02-dominio.md) §11.1). [03-flujo-organizacion.md](../03-flujo-organizacion.md) §7 y [05-pagos.md](../05-pagos.md) §6 decían que, al liberarse un lugar, el primero de la lista recibe aviso y pasa a `pendiente_pago`, pero no cuánto tiempo tiene para pagar.

Un lugar se libera cuando la organización da de baja a alguien, cuando vence una reserva sin pagar, cuando MercadoPago rechaza un pago o cuando la organización sube el cupo. La reserva normal dura 15 minutos: alcanza para quien está pagando frente a la pantalla, no para quien se entera por un email.

## Opciones consideradas

1. **Una reserva de 24 horas a nombre del primero, desde el aviso.** Si no paga, pasa sola al siguiente.
   - En contra: si nadie de la lista paga, el lugar puede tardar varios días en llenarse.
2. **Los 15 minutos de siempre, desde que abre el link**, como las solicitudes aprobadas ([decisión 054](054-perfil-pendiente.md)).
   - En contra: si nunca abre el email, el lugar queda trabado sin límite.
3. **Aviso a todos los de la lista, y el lugar es del primero que paga.**
   - En contra: no respeta el orden de llegada que pide el reglamento.
4. **Lo promueve la organización a mano.**
   - En contra: no es automático, que es lo que dicen 03 §7 y 05 §6.

## Decisión

Opción 1, elegida por el grupo, con las horas en el torneo para poder cambiarlas después.

- **`Torneo.horasReservaListaEspera`**, por defecto 24. Por ahora sin campo en Nuevo torneo, como las reprogramaciones ([decisión 067](067-parametros-de-reprogramacion.md)).
- **`promoverListaDeEspera()`**, en `apps/api/src/modules/inscripciones/lista-de-espera.service.ts`, corre en la misma transacción que libera el lugar: la baja, el vencimiento de reservas, el pago rechazado y la edición del cupo. Cuenta los lugares libres y se los da a los primeros de la lista, que pasan a `PENDIENTE_PAGO` con la reserva de 24 horas.
- **Después de la transacción sale el email** "Se liberó un lugar para vos" ([lugar-liberado.html](../pantallas/email/lugar-liberado.html)), con el link a la página de pago de su inscripción.
- **Si la reserva de 24 horas vence**, la tarea que vence las reservas la pasa a `EXPIRADA`, y el lugar pasa al siguiente con la misma función.
- **La lista termina cuando se confirma el sorteo** ([decisión 077](077-baja-hasta-el-sorteo.md)): desde ahí no se promueve a nadie.
- **La inscripción guarda su número de la lista** (`ordenListaEspera`). Así la organización ve en Reservando que esa reserva vino de la lista. Una reserva nueva lo borra.

## Por qué

- **Respeta el orden de llegada**, que es la regla del reglamento.
- **24 horas alcanzan para leer un email**, y el lugar nunca queda trabado más de eso por persona.
- **Una sola función para los cuatro casos:** cualquier forma de liberar un lugar termina igual.
- **Subir el cupo también pasa por la lista:** si no, quien entra al link después se adelantaría a quien espera.

## Qué se resigna

- **Con varios en la lista que no pagan, el lugar tarda un día por persona en llenarse.**
- **Sin email, no se avisa:** la organización lo ve en Reservando y le puede escribir. Quien se anota desde el link siempre tiene uno.
- **Si un pago aprobado llega después de vencida su reserva**, se confirma igual, como hasta ahora ([05-pagos.md](../05-pagos.md) §3). En el caso raro de que ese lugar ya se le haya dado al primero de la lista, el cupo queda pasado por uno, y la organización lo resuelve con una baja.
- **Anotarse en la lista desde el link** llega con el lado del jugador de F13. Hasta entonces, la lista se puede probar con el seed.
