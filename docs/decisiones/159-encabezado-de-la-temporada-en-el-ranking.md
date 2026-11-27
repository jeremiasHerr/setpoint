# 159 — El ranking público abre con lo que pasa en la temporada

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

El ranking público era la tabla y nada más. Quien lo abre desde el grupo no sabía qué torneo se estaba jugando, qué casillero iba a cambiar ni si había un torneo con la inscripción abierta. Todo eso el sistema lo sabe, y la página no lo mostraba.

## Opciones consideradas

1. **Un encabezado con tres piezas arriba de la tabla:** los torneos del calendario, el primero y el próximo torneo con la inscripción abierta.
   - En contra: la API tiene que sumar los torneos de cada categoría, y en el celular tres piezas tapan la tabla.
2. **Una columna al costado, solo en la compu,** con la tabla de puntos y los torneos.
   - En contra: le quita ancho a la planilla de la [decisión 155](155-ranking-y-ficha-en-la-compu.md), y en el celular queda abajo de todas las filas.
3. **Nada:** la tabla alcanza.
   - En contra: la página seguía sin decir qué está pasando en el circuito.

**En el celular:**

1. **Los torneos del calendario y el próximo torneo,** sin el primero.
2. **Las tres piezas, apiladas.**
   - En contra: la tabla arranca en la segunda pantalla.
3. **Solo los torneos del calendario.**
   - En contra: el link al torneo abierto queda solo en la compu.

## Decisión

La opción 1 en las dos, elegidas por el grupo.

- **Los torneos del calendario, como marcas** en una pieza noche: blancas las que ya dieron puntos en la categoría, y la del torneo que se está jugando, levantada y en `azul-claro`, como la barra levantada del logo ([decisión 104](104-logo-marcas.md)). Abajo, qué se está jugando y qué casillero reemplaza al cerrar.
- **El primero,** con sus puntos y la diferencia con el segundo. Solo en la compu: en el celular es la primera fila de la tabla.
- **El próximo con la inscripción abierta,** con su fecha de cierre y "Ver el torneo". Si no hay ninguno, la pieza no aparece.
- **La API suma a cada categoría `enJuego` e `inscripcionAbierta`.** En juego es la edición de un torneo del calendario que ya cerró la inscripción y todavía no terminó; si hay dos, la que arrancó más tarde. Un torneo suelto no está en juego, porque no cambia ningún casillero, pero sí puede ser el de la inscripción abierta. Si hay dos abiertos, va el que cierra primero.

## Por qué

- **Es lo que se viene a buscar:** cómo va la temporada y qué se juega ahora, sin salir del ranking.
- **Las marcas son las del sistema:** la barra del logo, el tablero y el cupo. La que está en juego va levantada, como en el logo.
- **La cuenta queda en la API,** que ya sabe qué torneo está en qué estado. La web solo lo dibuja.

## Qué se resigna

- **Las marcas van sin el año:** los puntos importados llevan el 1° de enero del año del casillero ([decisión 008](008-fecha-de-los-movimientos-importados.md)), así que el año no siempre es el de la edición anterior, y "reemplaza los de Primavera 26" mientras se juega Primavera 26 confundía.
- **La tabla baja** unos 170 px en la compu y casi una pantalla en el celular.
- **Un torneo publicado con la fecha de cierre pasada** sigue apareciendo como abierto, igual que en su página: la inscripción la cierra la organización.
