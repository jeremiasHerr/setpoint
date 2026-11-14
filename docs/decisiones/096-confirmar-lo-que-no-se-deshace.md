# 096 — Lo que no se deshace se confirma en un modal

**Estado:** aceptada — 14 de noviembre de 2026

## Contexto

En la web de la organización, cuatro acciones que no se deshacen se ejecutaban con el primer clic: cerrar la inscripción, confirmar y publicar el sorteo, cerrar las zonas y rechazar una solicitud. Un clic de más en la demo, o en un torneo real, cerraba una inscripción o generaba los partidos de zona sin vuelta atrás.

La única acción con un segundo paso era "Dar de baja", con un panel que se abría debajo de la fila y decía qué pasaba con el lugar.

## Opciones consideradas

1. **Un panel en línea, debajo del botón**, como el de "Dar de baja".
   - En contra: necesita lugar donde se abre, y cada acción está en un lugar distinto (el pie del sorteo, una tarjeta del tablero, una fila de tabla).
2. **Un modal, con el fondo desenfocado.**
   - En contra: tapa lo que se está confirmando, por ejemplo las tablas con las que se arman los cuadros. design.md no tenía cómo se ve el fondo.
3. **El mismo botón pide el segundo clic**, cambiando el texto unos segundos.
   - En contra: no entra la lista de lo que va a pasar, y un doble clic apurado confirma igual.

## Decisión

Opción 2, elegida por el grupo, también para "Dar de baja".

- **Un solo componente, `Confirmacion`**, sobre el `<dialog>` del navegador. Lleva el título, lo que haga falta elegir antes (la devolución, al dar de baja), la lista de lo que va a pasar con los números reales, y Cancelar y la acción.
- **El fondo es `--negro` al 40 %, desenfocado 4 px.** El modal lleva borde y no tiene sombra, como el resto del sistema.
- **Se cancela** con Cancelar, con Escape o con un clic en el fondo. Mientras la acción está en curso, no se cierra. Si falla, el error queda en el modal.
- **El foco arranca en lo primero que se puede tocar**: la elección o Cancelar, nunca la acción. Un Enter apurado no confirma.
- **Qué dice cada uno:**

  | Acción | Lo que va a pasar |
  |---|---|
  | Cerrar inscripciones | Quiénes entran al sorteo, las reservas sin pagar que quedan afuera, las solicitudes que se cierran, que nadie más se inscribe desde el link y que el torneo ya no se edita |
  | Confirmar y publicar | Cuántos partidos de zona se generan, que los jugadores con la app reciben el aviso, y que ya no se vuelve a sortear ni se da de baja a nadie |
  | Cerrar las zonas | Cuántos van a cada cuadro, y que después un resultado de zona solo se corrige si los cuadros quedan iguales |
  | Rechazar | Que le llega un email sin motivo, y que no entra al torneo ni al padrón |
  | Dar de baja | Si le corresponde la devolución, y a quién pasa su lugar |

- **Cerrar el torneo no lleva modal**: su pantalla ya es la revisión completa antes del botón.

## Por qué

- **Es igual en las cinco**, esté el botón donde esté. Un panel en línea se veía distinto en el pie del sorteo, en una tarjeta y en una fila.
- **El `<dialog>` del navegador ya resuelve lo difícil de un modal**: atrapa el foco, cierra con Escape y deja inerte lo de atrás. No hace falta una librería.
- **Dice lo que va a pasar antes de que pase** (design.md §2), con los números de ese torneo y no con un "¿Estás seguro?".

## Qué se resigna

- **El modal tapa la pantalla**, y con ella lo que se está confirmando. Lo compensa con los números: cuántos entran al sorteo, cuántos van a cada cuadro.
- **La baja ya no se ve al lado de la fila** de quien se da de baja, como en la referencia de Inscripciones (estado 3). El nombre va en el título.
