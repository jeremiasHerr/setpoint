# 094 — El inicio con el circuito arriba y los torneos en columnas

**Estado:** aceptada — 13 de noviembre de 2026

## Contexto

El inicio del organizador listaba los torneos por grupos ("En juego", "Inscripción abierta", "Terminados"), uno debajo del otro, con el resumen del circuito en una columna a la derecha. Al recorrerlo con pocos torneos, que es como arranca cualquier circuito, el grupo encontró dos problemas:

- **La pantalla quedaba casi en blanco:** dos tarjetas arriba y el resto vacío.
- **No se entendía que los torneos son del circuito.** El nombre de la organización estaba solo en el encabezado, y ninguna tarjeta decía a qué torneo del calendario pertenecía.

Se dibujaron cuatro bocetos en el canvas *Landing SetPoint*.

## Opciones consideradas

1. **El circuito arriba:** una tarjeta con el circuito y sus torneos del calendario, y abajo la edición en curso con una tarjeta grande por categoría.
   - En contra: está pensado alrededor de una sola edición en curso. Con un torneo suelto en paralelo, o dos ediciones, hay que decidir cuál va arriba.
2. **La temporada en columnas:** una franja con el circuito y, abajo, cuatro columnas por momento (en preparación, inscripción, en juego, terminados).
   - En contra: con muchos torneos en un mismo momento, esa columna se alarga y las demás quedan cortas.
3. **La temporada en el tiempo:** un calendario con una barra por categoría (inscripción, zonas, cuadros) y una línea en el día de hoy.
   - En contra: las fechas de los cuadros salen estimadas con los plazos, y un borrador sin fechas no tiene dónde dibujarse.
4. **El circuito como mapa:** un menú a la izquierda con el circuito, sus torneos del calendario y sus categorías, y a la derecha el torneo elegido.
   - En contra: repite parte de *Tu circuito*, y para ver todos los torneos hay que ir eligiendo de a uno.

## Decisión

Opción 2, elegida por el grupo.

- **Una franja negra** pegada al encabezado, con "Tu circuito", el nombre y las cifras que ya estaban (jugadores, categorías, recaudado en inscripciones abiertas). Con ranking, muestra también cada torneo del calendario con su última edición y en qué anda; sin ranking, lo dice.
- **Cuatro columnas** que llegan hasta abajo de la pantalla: en preparación, inscripción (primero las que esperan el sorteo), en juego y terminados (los últimos cuatro y "Ver los anteriores"). Vacía, cada columna dice qué va a aparecer ahí.
- **Cada tarjeta dice a qué pertenece:** su torneo del calendario, "torneo suelto" o "del circuito". La API lo manda en el listado del inicio, que ya lo tenía.
- **La barra de marcas** de design.md §6 en cada tarjeta, en vez de la barra de progreso: una marca por lugar del cupo o por partido.
- **"Necesita tu atención"** pasa a una franja roja arriba de las columnas, solo con partidos vencidos.
- **El inicio sin torneos no cambia** ([decisión 088](088-dos-caminos-iguales-en-el-inicio.md)).

## Por qué

- **Ocupa la pantalla con lo que hay:** las columnas llenan el ancho y el alto aunque tengan una tarjeta cada una, y la columna vacía explica qué va a aparecer.
- **El circuito queda arriba de todo** y cada torneo dice de qué torneo del calendario es, que era lo que no se entendía.
- **Las columnas son el recorrido de un torneo**, de izquierda a derecha: se ve de un vistazo qué falta hacer, sin leer una lista.
- **Usa los datos que ya existían.** La API solo suma el torneo del calendario y si es suelto; el calendario de la opción 3 necesitaba fechas que no se guardan, y el historial de la opción 4, datos nuevos.

## Qué se resigna

- **Con muchos torneos terminados, la columna crece:** por eso muestra los últimos cuatro.
- **El resumen del circuito pierde la nota sobre el ranking** que tenía la columna de la derecha; ahora lo dicen los torneos del calendario de la franja.
- **En el celular las columnas se apilan**, y para llegar a los terminados hay que bajar por las otras tres.
