# 004 — El borrador del torneo se guarda solo

**Estado:** aceptada — 4 de octubre de 2026

## Contexto

La pantalla *Nuevo torneo* ([nuevo-torneo.html](../pantallas/organizador/nuevo-torneo.html)) es un formulario largo: seis secciones y más de quince campos, que la organización completa mirando el panel *Cómo queda* mientras prueba formatos. La referencia muestra en el encabezado "borrador · se guarda solo" y dos botones: *Publicar el torneo* y *Dejarlo en borrador*.

La API ya separa las dos cosas: `POST` y `PUT` guardan el borrador, que puede estar incompleto (sin fechas), y `POST /:id/publicar` es el único paso que exige que esté completo y lo hace visible.

Al conectar la pantalla con la API había que decidir **cuándo** se guarda el borrador.

## Opciones consideradas

1. **Autoguardado.** La pantalla guarda sola un momento después del último cambio. El primer guardado crea el borrador y la URL pasa a `/torneos/:id`.
   - En contra: es más código que un botón (espera, cola de guardados, estado en el encabezado). Guarda borradores que quizás nadie quería conservar. Mientras el formulario no pasa la validación no se guarda nada, y eso hay que avisarlo.
2. **Guardar con un botón.** Nada viaja a la API hasta que se toca *Guardar borrador* o *Publicar*.
   - En contra: cerrar la pestaña o recargar pierde todo lo escrito. Obliga a avisar "tenés cambios sin guardar" al salir. Contradice la pantalla de referencia y a *Tu circuito*, que ya se guarda sola.
3. **Guardar en el navegador (`localStorage`) y mandar a la API solo al publicar.**
   - En contra: el borrador queda atado a un navegador: no lo ve otro miembro del comité ni la misma persona desde otra máquina. Aparecen dos fuentes de verdad, y los errores que solo detecta la API (nombre repetido) recién aparecen al publicar.

## Decisión

Opción 1, con el mismo mecanismo que *Tu circuito*. Vive en `useAutoguardadoConvocatoria` (`apps/web/src/features/torneos/useConvocatoria.ts`):

- Se guarda **800 ms después del último cambio**.
- Antes de mandar, se valida con `convocatoriaSchema`. Si no pasa, **no se guarda**: el encabezado dice "sin guardar" y el motivo aparece al lado del campo.
- La primera vez es un `POST`; con el id que devuelve, la URL se reemplaza por `/torneos/:id`. De ahí en más es `PUT` de la convocatoria completa.
- **Nunca hay dos guardados en vuelo.** Si algo cambia mientras se guarda, al terminar se guarda de nuevo.
- *Publicar* y *Dejarlo en borrador* primero mandan lo pendiente, sin esperar los 800 ms.

## Por qué

- **No se pierde trabajo.** Recargar, cerrar la pestaña o que se caiga la conexión deja, a lo sumo, el último segundo sin guardar. En un formulario de este tamaño es lo que más duele.
- **Guardar y publicar ya son dos cosas distintas en el dominio.** El borrador no lo ve ningún jugador, así que guardarlo sin preguntar no tiene consecuencias. La única acción con consecuencias es publicar, y es la única que tiene botón.
- **Es consistente.** *Tu circuito* ya funciona así; la organización aprende un solo comportamiento.
- **Un solo guardado a la vez evita dos errores concretos:** que dos `POST` simultáneos creen dos torneos, y que un `PUT` viejo llegue después de uno nuevo y lo pise.
- **La URL con id hace que recargar funcione:** vuelve a pedir el mismo borrador en vez de empezar uno nuevo.

## Qué se resigna

- **Descartar es un paso aparte.** Todo lo que se escribe queda guardado: quien entra "solo a mirar" y pone un nombre deja un borrador. Borrarlo va a necesitar su propia acción, que hoy no existe.
- **No hay "deshacer hasta el último guardado".** Lo guardado es siempre lo último que se escribió.
- **Un borrador inválido no se guarda en absoluto.** No se guarda "lo que se pueda": mientras falte el nombre o no haya categorías, los demás cambios quedan solo en pantalla.
- **Más pedidos a la API**, uno por cada pausa al escribir. Para el volumen de una organización no pesa.
- **Dos personas editando el mismo borrador se pisan:** gana el último `PUT`. No se resuelve; el caso todavía no existe porque cada organización tiene un solo administrador ([002](002-organizacion-al-ingresar.md)).
