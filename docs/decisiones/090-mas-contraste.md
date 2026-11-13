# 090 — Más contraste en los bordes y el interruptor

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

Al recorrer la web, el grupo encontró problemas de contraste. El interruptor apagado (fondo `--linea` con la bolita blanca) casi no se veía sobre blanco, y los bordes de las tarjetas (`--linea`, `#E6E8EB`) y de los campos (`--gris-300`, `#C9CDD3`) se perdían en muchas pantallas.

## Opciones consideradas

1. **Cambiar los valores de los tokens.**
   - En contra: el cambio llega a todas las pantallas a la vez, también a las que se veían bien.
2. **Reforzar pantalla por pantalla**, con otras clases.
   - En contra: los mismos bordes quedarían de dos tonos distintos, y design.md dejaría de ser la fuente.

## Decisión

Opción 1, pedida por el grupo.

- `--linea`, el borde de tarjeta y separador: de `#E6E8EB` a `#D5D9DE`.
- `--gris-300`, el borde de campo: de `#C9CDD3` a `#B5BBC3`.
- **Interruptor:** prendido, lima con un anillo negro y la bolita negra; apagado, `--gris-400` con la bolita blanca (design.md §6).
- **Mismos valores en la app** ([decisión 034](034-tokens-de-la-app.md)).

## Por qué

- **Son tokens:** un valor cambia toda la web y la app sin tocar ninguna pantalla, y siguen siendo uno solo.
- **El interruptor tiene que decir su estado de un vistazo.** Lima es el color de "activo" del sistema (el clasificado, el partido destacado), y el gris apagado se distingue del blanco y de `--fondo`.

## Qué se resigna

- **La interfaz se ve algo más "dibujada"**, con menos aire entre las tarjetas.
- **Las referencias de `docs/pantallas/` quedan con los valores anteriores.** No se reescriben: los tokens mandan.
