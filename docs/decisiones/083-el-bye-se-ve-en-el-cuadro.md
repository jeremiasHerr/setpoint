# 083 — Quien pasa directo por un bye se ve en el cuadro

**Estado:** aceptada — 10 de noviembre de 2026

## Contexto

Un bye no crea partido ([decisión 023](023-byes-sin-partido.md)): quien lo tiene ya figura en su partido de la segunda ronda. El cuadro completo dejaba vacío ese lugar de la primera ronda, para que cada partido siguiera a la altura de los dos que lo alimentan, y la vista por ronda del celular directamente no lo mostraba ([decisión 038](038-cuadros-en-el-celular.md)).

Al recorrer la demo como organizador, el Campeonato de la Copa Alta Barda (6 clasificados, cuadro de 8) se leyó como un cuadro incompleto: dos partidos en cuartos, dos huecos, y nada que dijera por qué Antileo y Sanhueza aparecían directo en semis. La decisión 023 ya lo resignaba: para saber que alguien tuvo bye hay que mirar el cuadro. Pero el cuadro no lo decía.

## Opciones consideradas

1. **Una tarjeta tenue en el lugar vacío**, con el apellido de quien pasa directo y el rótulo "pasa directo a semis".
   - En contra: el nombre aparece dos veces, en la primera ronda y en la segunda, y es un elemento nuevo del sistema visual.
2. **Solo el rótulo "pasa directo"** en el lugar vacío, sin tarjeta.
   - En contra: para saber quién es hay que mirar la ronda siguiente.
3. **Una marca "bye" en la tarjeta de la segunda ronda**, junto al nombre.
   - En contra: la primera ronda sigue viéndose incompleta, que es justo lo que confundía, y aprieta una tarjeta de 190 px.

## Decisión

Opción 1.

- **La tarjeta tiene el mismo alto que la de un partido**, con borde de 1px `--linea`, sin fondo, el apellido en `--gris-500` y el rótulo en mono `--gris-400`: "pasa directo a semis", o "pasa directo a la final" en un cuadro de 3 o 4. Con el mismo alto, los codos siguen saliendo de la mitad de cada tarjeta, y el codo del par vuelve a dibujarse completo.
- **No se toca:** no hay partido para abrir, ni para elegir en *Cargar resultado*, que usa el mismo cuadro.
- **En el celular aparece en la primera ronda**, en su lugar del cuadro, con la misma tarjeta. Modifica la decisión 038, que dejaba los byes afuera de esa vista.
- **La API no cambia.** La web sabe quién pasó directo por la posición: el lugar k de la primera ronda lleva al partido ⌈k/2⌉ de la segunda, como jugador A si k es impar y como B si es par. Esa regla (`lugarSiguiente`) pasa de la API a `packages/shared`, y la usan las dos: la API para armar el cuadro y la web para dibujarlo. Mirar solo el partido vecino no alcanza: con 5 clasificados en un cuadro de 8 hay dos byes seguidos, y ninguno tiene vecino.

## Por qué

- **El cuadro se lee completo:** cada lugar de la primera ronda tiene algo, y lo que tiene dice qué pasó.
- **Una sola regla para el lado:** si la web la copiara, un cambio en el armado del cuadro dibujaría a otro jugador en el bye sin que nada fallara.
- **El bye sigue sin registro propio** ([decisión 023](023-byes-sin-partido.md)): alcanza con lo que la API ya devuelve.

## Qué se resigna

- **El nombre de quien tuvo bye aparece dos veces** en el cuadro completo.
- **Es un elemento más en [design.md](../design.md) §6**, que hay que respetar si otra superficie dibuja cuadros, como la app.
- **Con byes, la primera ronda ocupa lo mismo que si estuviera llena:** los huecos dejaban aire entre los partidos.
