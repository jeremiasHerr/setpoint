# 112 — Las sumas de la siembra se comparan entre zonas del mismo tamaño

**Estado:** aceptada — 19 de noviembre de 2026.

## Contexto

El *Sorteo de zonas* dice si las zonas quedaron parejas comparando lo que suma cada una con las posiciones de siembra de sus jugadores. Con el cupo lleno funciona: en serpentina todas suman lo mismo ([02-dominio](../02-dominio.md) §4.2), y en directa o por bombos no.

Si el cupo no se llena, quedan zonas de 3 ([decisión 015](015-zonas-con-menos-inscriptos.md)). A cada una le falta el más débil de su zona, así que suma menos. Con 30 jugadores en 8 zonas, en serpentina, las 6 zonas de 4 suman 66 y las 2 de 3 suman 34 y 35. La pantalla decía "No quedaron parejas", justo en el modo que las empareja.

## Opciones consideradas

1. **El promedio por jugador.**
   - En contra: tampoco da igual. Las de 4 promedian 16,5 y las de 3, 11,3 y 11,7, porque lo que les falta es justamente el número más alto.
2. **Comparar solo las zonas completas, y de las de 3 decir cuánto suman.**
3. **Cada tamaño por su lado, sin decir si están parejas.**
   - En contra: en serpentina se pierde el "están parejas", que es lo que el organizador busca.
4. **Sumarle a cada zona de 3 el número que le habría tocado con el cupo lleno**, y comparar todas.
   - En contra: ese número no es el que se ve en las zonas, y hay que explicarlo.

## Decisión

Opción 2, elegida por el grupo.

- **Con todas las zonas del mismo tamaño, no cambia:** "Las 8 zonas suman 66. Están parejas."
- **Con zonas de 3 y de 4:** "Las 6 zonas de 4 suman 66: están parejas. Las 2 de 3 suman 34 y 35, con un jugador menos." Si las de 4 no suman lo mismo, dice "no quedaron parejas".
- **Con una sola zona completa** no hay con qué compararla: dice cuánto suma cada tamaño, sin decir si están parejas.
- **La ayuda de la serpentina** deja de prometer que "todas las zonas suman lo mismo". Ahora dice que invierte la dirección "para emparejar las zonas".

## Por qué

- **Las zonas completas son las que se pueden comparar:** tienen un jugador de cada franja de la siembra. En serpentina siempre suman lo mismo, y en directa o por bombos no. Eso es lo que el resumen tiene que mostrar.
- **Todo lo que dice es cierto en los tres modos**, y sin números que no estén en la pantalla.

## Qué se resigna

- **Las zonas de 3 no se comparan entre sí.** En serpentina difieren en uno (34 y 35) por cómo cae la última vuelta, y por bombos pueden quedar más desparejas sin que el resumen lo marque. Las sumas igual están a la vista en cada zona.
- **Con todas las zonas de 3** (24 jugadores en 8 zonas), la serpentina no las empareja. Son tres vueltas, y nada compensa la tercera, así que el resumen dice "No quedaron parejas", que es cierto.
