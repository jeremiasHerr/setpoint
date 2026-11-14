# 095 — Las pantallas del torneo comparten una franja con pestañas

**Estado:** aceptada — 13 de noviembre de 2026. Reemplaza las migas de la [decisión 058](058-como-se-llega-al-cierre.md) y de la [decisión 063](063-entrada-al-tablero.md). Las entradas que definen esas decisiones se mantienen.

## Contexto

Las cinco pantallas de un torneo (Inscripciones, Sorteo de zonas, Tablero, Cargar resultado y Cierre) se sumaron de a una, y cada una se enlazaba a mano con la siguiente (decisiones [031](031-como-se-llega-a-cargar-resultado.md), 058 y 063). El menú de arriba no marcaba ninguna. Al revisar el frontend aparecieron tres caminos que faltaban:

- **Con el sorteo confirmado no se volvía a Inscripciones**, donde están la conciliación y las devoluciones.
- **Con el torneo cerrado no había cómo llegar a corregir un resultado**, aunque la [decisión 055](055-correccion-despues-del-cierre.md) lo permite.
- **Un torneo publicado no tenía entrada para editarlo.**

Las referencias [tablero.html](../pantallas/organizador/tablero.html) y [cierre.html](../pantallas/organizador/cierre.html) dibujan pestañas, pero adentro del encabezado negro y solo tres (Zonas, Cuadros, Cierre).

## Opciones consideradas

Dónde va la navegación:

1. **Una franja debajo del encabezado**, con el nombre de la edición y una pestaña por pantalla.
   - En contra: no es lo que dibujan las referencias, y suma una fila de alto en cada pantalla.
2. **Las pestañas adentro del encabezado negro**, como en las referencias: el nombre de la edición en lugar del de la organización, y las pestañas en lugar de Inicio, Circuito y Padrón.
   - En contra: dentro del torneo se pierde el menú general y solo se sale por el logo. Cinco pestañas con las iniciales y "Salir" no entran en los 60 px del encabezado.
3. **Migas en las cinco pantallas.**
   - En contra: no muestran en qué momento está el torneo ni qué viene, y no pueden decir por qué algo todavía no está disponible.

De dónde sale qué pestaña se puede abrir:

- **a. Una ruta de la API** que lo diga para el torneo.
  - En contra: un pedido más en cada pantalla, y hay que refrescarlo en las acciones que cambian el estado del torneo.
- **b. Cada pantalla le pasa a la franja lo que ya sabe.**
  - En contra: hay que sumar los mismos campos a cinco respuestas distintas y la regla queda repartida. *Cargar resultado* ni siquiera sabe el estado del torneo (decisión 058).

## Decisión

Opciones 1 y a, elegidas por el grupo.

- **La franja va debajo del encabezado, igual en las cinco pantallas:** el nombre de la edición, su estado como chip en mono ([design.md](../design.md) §7) y las pestañas Inscripciones · Zonas · Tablero · Resultados · Cierre. Mientras toda la convocatoria tiene la inscripción abierta, a la derecha va "Editar el torneo", que abre *Nuevo torneo*.
- **Qué pestaña se abre:**

  | Pestaña | Pantalla | Se abre |
  |---|---|---|
  | Inscripciones | Inscripciones | Siempre |
  | Zonas | Sorteo de zonas | Con la inscripción cerrada |
  | Tablero | Tablero | Con el sorteo confirmado |
  | Resultados | Cargar resultado | Con el sorteo confirmado, también con el torneo cerrado |
  | Cierre | Cierre | Con los campeones definidos, o con el torneo cerrado |

- **Una pestaña apagada no es un link.** Se ve en gris y, al tocarla, una línea debajo de la franja dice por qué. No es un tooltip, porque en el celular no se ve.
- **La API lo calcula** en `GET /api/organizaciones/:slug/torneos/:id/navegacion`, con una función pura que tiene sus tests. "Editar el torneo" usa la misma regla que la edición de la convocatoria. La franja se refresca al cerrar la inscripción, confirmar el sorteo, cerrar las zonas, guardar un resultado y cerrar el torneo.
- **El menú de arriba marca Inicio**, que es de donde se llega a cada torneo.
- **Salen las migas** de *Cargar resultado* y del *Cierre*, y el nombre del torneo que repetían Inscripciones, el Sorteo y el Tablero: ahora lo dice la franja. Los botones que llevan al paso siguiente ("Ir al tablero", "Cerrar el torneo") se quedan.
- **Las pestañas no llevan contadores** (inscriptos, resultados cargados).

## Por qué

- **Resuelve los tres caminos con una sola pieza**, y la próxima pantalla del torneo solo suma una pestaña.
- **La regla vive en un solo lugar**, la API, con tests, como el resto del estado del torneo. La web solo la dibuja.
- **Se ve en qué momento está el torneo y qué viene**, que las migas no decían.
- **Se entra igual que antes:** desde la tarjeta del torneo en el inicio, que lleva a la pantalla que corresponde a su estado ([decisión 080](080-torneos-en-juego-y-terminados-en-el-inicio.md)). No hace falta una página de entrada al torneo, y `/torneos/:id` ya es *Nuevo torneo*, con el id de la convocatoria.

## Qué se resigna

- **No es lo que dibujan las referencias** del tablero y del cierre, que ponen las pestañas en el encabezado negro.
- **Un pedido más a la API en cada pantalla del torneo.** Al cambiar de pestaña la franja se ve enseguida, porque queda en la caché.
- **Los contadores del boceto** ("Inscripciones 32", "Resultados 31/48"). Cada pantalla ya muestra los suyos, y sumarlos haría que la API cuente inscripciones y partidos cada vez que se abre una pantalla del torneo.
