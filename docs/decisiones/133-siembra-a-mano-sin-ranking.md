# 133 — La siembra a mano se ordena entera y el sorteo la respeta

**Estado:** aceptada — 22 de noviembre de 2026.

## Contexto

F05 dice que "en torneos sin ranking, el orden de siembra lo define la organización manualmente o se sortea al azar". Hasta ahora solo existía el azar: sin ranking todos empatan en 0, y la decisión 013 los ordena al azar. Una organización que conoce a sus jugadores no podía decir quién encabeza cada zona.

El orden de siembra ya se guarda en `Inscripcion.posicionSiembra` (decisión 014), y los tres modos de distribución parten de él.

## Opciones consideradas

1. **La lista entera:** la organización arrastra a cada inscripto a su lugar, del mejor sembrado al último.
   - En contra: con 32 inscriptos es arrastrar mucho. Se atenúa arrancando con el orden que ya tienen, para tocar solo lo que se quiera.
2. **Solo las cabezas de serie:** se marca quién encabeza cada zona y el resto sale al azar.
   - En contra: no ordena a los segundos ni a los terceros, y la serpentina y la directa usan el orden completo.

## Decisión

Opción 1, elegida por el grupo.

- **Se puede sin ranking o en un torneo suelto,** donde todos empatan en 0. Con ranking, la siembra es el ranking y no se toca.
- **En el *Sorteo de zonas*, "Orden de siembra": "Al azar" o "Lo ordeno yo".** Con "Lo ordeno yo" aparece la lista, que se reordena arrastrando o con el teclado, y "Guardar el orden". Mientras haya un orden sin guardar no se puede sortear.
- **`PUT .../sorteo/siembra`** recibe a todos los inscriptos en orden, o `null` para volver al azar. Descarta el borrador de zonas, que se armó con otra siembra.
- **El torneo guarda que la siembra es a mano** (`Torneo.siembraManual`). Con eso, "Volver a sortear" no la mezcla: reparte de nuevo con el mismo orden, y solo los bombos cambian las zonas. Si entró o se bajó alguien, el sorteo pide ordenarla de nuevo.
- **Para reordenar se suma `@dnd-kit/sortable`,** de la misma familia que `@dnd-kit/core`, que ya usa la carga manual del sorteo (decisión 020). Trae el movimiento con teclado y los anuncios para lectores de pantalla.

## Por qué

- **Es lo que pide F05,** sobre el mismo borrador que ya usan los tres modos: no hay una forma nueva de armar las zonas, solo otra fuente para el orden.
- **Guardar que es a mano evita perderlo por un clic:** sin el campo, "Volver a sortear" lo hubiera mezclado al azar.

## Qué se resigna

- **Un campo y una migración** en `Torneo`.
- **Ordenar a 32 jugadores lleva un rato.** No hay atajos, como subir a alguien de a diez puestos.
