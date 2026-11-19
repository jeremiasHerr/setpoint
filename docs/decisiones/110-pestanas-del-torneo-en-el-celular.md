# 110 — En el celular, las pestañas del torneo van en una grilla de dos filas

**Estado:** aceptada — 19 de noviembre de 2026.

## Contexto

Las cinco pantallas de un torneo comparten una franja con pestañas: Inscripciones, Zonas, Tablero, Resultados y Cierre ([decisión 095](095-navegacion-del-torneo.md)). Con el texto de 15 que fija design.md, las cinco en una fila miden 444 px, y en un celular de 360 hay 328. Hasta ahora se partían en dos filas sin querer: "Resultados" y "Cierre" caían solas abajo y la pestaña activa podía quedar subrayada en el medio de la franja.

design.md descarta dos salidas: no permite scroll horizontal en el celular, y pide que las pestañas no se parezcan a los chips, que filtran dentro de una pantalla.

## Opciones consideradas

1. **Un desplegable** con la pantalla actual y "2 de 5", que abre la lista de las cinco.
   - En contra: para ver las otras pantallas hay que tocar, y queda un segundo menú debajo del "Menú" del encabezado.
2. **La franja se desliza de costado**, cortada con un desvanecido.
   - En contra: rompe la regla del scroll horizontal, y "Resultados" y "Cierre", lo que más se usa durante el torneo, quedan fuera de la pantalla.
3. **Las cinco en una fila, más chicas:** texto de 14, sin margen y "Inscriptos" en lugar de "Inscripciones".
   - En contra: a 360 entra sin un píxel de sobra y se rompe con la letra del celular agrandada.
4. **Las pantallas del torneo dentro del "Menú" del encabezado** ([decisión 109](109-menu-del-organizador-en-el-celular.md)).
   - En contra: el mismo botón mostraría cosas distintas según la pantalla, y nada avisa que las del torneo están ahí.
5. **El título de la pantalla como selector**, con un chevron al lado.
   - En contra: un toque más, y en *Cargar resultado* el título es el partido, no el nombre de la pantalla.
6. **Una grilla de tres columnas y dos filas.**
   - En contra: la franja suma una fila, unos 44 px, en las cinco pantallas.

Las seis se compararon sobre el Sorteo de zonas real, a 360.

## Decisión

Opción 6, elegida por el grupo.

- **Debajo de 640 px, las pestañas van en una grilla de tres columnas:** Inscripciones, Zonas y Tablero arriba; Resultados y Cierre abajo. Desde 640 las cinco entran en la fila de siempre.
- **Cada pestaña ocupa su celda, sin margen**, con el texto a la izquierda: la primera columna arranca en la línea de las migas.
- **La fila de arriba lleva una línea de base `linea-suave`**, y la de abajo apoya en el borde de la franja. Así las dos se leen como pestañas, esté donde esté la activa.
- **La activa, las disponibles y las apagadas no cambian**, y el motivo de una apagada sigue apareciendo debajo de la franja.
- **La franja pasa a márgenes de 16 en el celular**, como el encabezado.

## Por qué

- **No esconde nada:** las cinco pantallas, y cuáles todavía no se abren, se ven sin tocar.
- **Cambiar de pantalla sigue siendo un toque**, igual que en la compu.
- **No depende de cuántos píxeles sobran:** cada columna mide 109 px a 360 y "Inscripciones" ocupa 93, así que entra aunque el celular tenga la letra un poco agrandada.
- **No hay nada nuevo que aprender:** son las mismas pestañas, ordenadas en dos filas a propósito.

## Qué se resigna

- **Unos 44 px de alto** en las cinco pantallas del torneo, en el celular.
- **La activa se subraya en su fila**, así que cuando está arriba la línea no toca el borde de la franja.
