# 101 — Un torneo publicado se edita desde el engranaje de su tarjeta

**Estado:** aceptada — 14 de noviembre de 2026.

## Contexto

Desde la [decisión 095](095-navegacion-del-torneo.md), un torneo publicado se edita con "Editar el torneo", en la franja de sus pantallas. Pero la tarjeta de la categoría en el inicio, en la columna "Inscripción", solo tiene "Inscripciones" y "Copiar link". Para editar había que adivinar que estaba adentro de Inscripciones: el grupo lo encontró al recorrer la web, y no le pareció que fuera el único camino.

Editar sigue siendo posible solo mientras toda la convocatoria tiene la inscripción abierta: después, el sorteo ya usó el formato. Eso no cambia.

## Opciones consideradas

1. **Una pestaña "Configuración" en la franja del torneo**, y la edición dentro de la franja.
   - En contra: la edición es de la convocatoria entera (todas sus categorías), y la franja es de una sola. Además, cambia la ruta de la edición, y desde el inicio sigue habiendo que entrar a Inscripciones primero.
2. **Un tercer botón de texto, "Editar", en la tarjeta.**
   - En contra: la tarjeta ya tiene dos acciones, y en una columna de 270 px tres botones no entran en una fila y compiten con "Inscripciones".
3. **Un engranaje arriba a la derecha de la tarjeta**, en la fila de la etiqueta del torneo del calendario.
   - En contra: un ícono sin texto se descubre menos que un botón que lo dice, y no estaba en el set de íconos.

## Decisión

Opción 3, propuesta por el grupo.

- **El engranaje va solo en las tarjetas que se pueden editar:** las de la columna "Inscripción" mientras toda la convocatoria tiene la inscripción abierta. Si se mostrara para después decir que no, confundiría; los borradores ya tienen "Seguir editando", y las demás columnas ya no se editan.
- **Usa la misma regla que la franja.** La API la manda calculada en el listado de convocatorias (`sePuedeEditar`), con la misma función que "Editar el torneo" y que la edición misma. La web no la repite.
- **Dice qué hace:** "Editar el torneo" en `aria-label` y en `title`. El área de toque es de 44 aunque el dibujo sea de 20.
- **Abre la edición de la convocatoria**, y sus migas vuelven a la categoría desde la que se llegó ([decisión 100](100-migas-de-pan.md)).
- **"Editar el torneo" sigue en la franja**, para quien ya está adentro del torneo.

## Por qué

- **Es una convención conocida:** el engranaje es "la configuración de esto", y eso es lo que se edita (formato, fechas, cupo, inscripción).
- **No llena la tarjeta:** "Inscripciones" sigue siendo la acción principal y el engranaje queda en una fila que ya existía.
- **La regla vive en un solo lugar**, como pide la 095.

## Qué se resigna

- **Un ícono sin texto.** Quien no lo reconozca tiene que pasar el mouse por encima, o encontrar "Editar el torneo" en la franja.
- **Un campo más en el listado de convocatorias**, que la API calcula para cada una.
