# 111 — El sorteo confirmado muestra las zonas primero

**Estado:** aceptada — 19 de noviembre de 2026. Reemplaza el botón "Ir al tablero" del Sorteo confirmado, de la [decisión 063](063-entrada-al-tablero.md), que la [decisión 095](095-navegacion-del-torneo.md) mantenía.

## Contexto

Confirmado el sorteo, el *Sorteo de zonas* es lo que se ve al tocar la pestaña Zonas durante toda la fase de grupos. Pero la pantalla seguía armada para sortear:

- **Las zonas quedaban abajo.** Arriba seguían las dos tarjetas de opciones, "Cómo se reparten" y "Quién lo ejecuta", en gris y sin poder tocarse. A 375 px, las zonas aparecían recién a unos 1.100 px.
- **Dos estados se contradecían.** La franja decía `grupos en curso` y la pantalla, `publicado`. El chip hablaba del sorteo, pero "publicado" es también el estado de un torneo con la inscripción abierta.
- **El pie repetía la pestaña Tablero** con "Ir al tablero". Faltaba lo que se hace después de un sorteo: compartirlo en el grupo, como pide el reglamento de POLENTA.
- **A 1440, cuatro tarjetas chicas** dejaban media pantalla vacía.

## Opciones consideradas

Para la compu, con el celular ya resuelto con las tarjetas de siempre:

1. **Las tarjetas de hoy, con las zonas arriba.**
   - En contra: a 1440 las cuatro tarjetas ocupan una franja angosta y la pantalla parece vacía.
2. **Una tabla con las zonas en columnas y la siembra por filas**, con una línea que une la siembra del 1 al 16.
   - En contra: la línea pasaba por los nombres y había que aprender a leerla.
3. **Una hoja con las zonas en columnas y, al pie de cada una, la "huella" de su siembra:** los 16 lugares en bloques de 4, con los suyos en oscuro.
   - En contra: la huella necesitaba una nota para entenderse, y en el Tablero y en el logo la misma marca oscura es un partido jugado.
4. **La hoja, sin la huella.**

## Decisión

Opción 4, elegida por el grupo.

- **Con el sorteo confirmado, las zonas van arriba.** Las opciones se resumen en la bajada: "16 jugadores en 4 zonas de 4, sorteadas a mano · 24 partidos y 21 días para jugarlos". Si sorteó el sistema, dice "por el sistema" y el reparto ("en serpentina").
- **Sale el chip del sorteo.** El estado lo dice la franja.
- **"Ir al tablero" pasa a ser "Copiar el link de las zonas"**, que lleva a la página en vivo. Al Tablero se llega por su pestaña.
- **Desde 1024 px, las zonas van en una hoja:** una tarjeta con una columna por zona, separadas por una línea de 1 px. Cada zona lleva su suma en el encabezado; cada jugador, su número de siembra y el nombre completo con el apellido en negrita. El número de la cabeza de serie va en negrita. Con 8 zonas, dos filas de cuatro.
- **Debajo de 1024 siguen las tarjetas.**
- **Antes de confirmar**, "Quién lo ejecuta" va primero y "Cómo se reparten" no aparece si se carga a mano. La vista previa usa la misma hoja, rotulada "Así quedarían · borrador, todavía no lo ve nadie". En el celular, la barra con "Sortear" y "Confirmar y publicar" queda fija abajo.
- **Fondo `niebla`**, como pide design.md.

## Por qué

- **Lo que se busca en la pestaña Zonas son las zonas.** Las opciones ya no se pueden cambiar; alcanza con decir cómo se sorteó.
- **La hoja usa el ancho sin inventar contenido:** los nombres completos se leen y las sumas, que muestran que las zonas quedaron parejas, están a la vista.
- **Compartir es el paso siguiente real** del sorteo en un circuito como POLENTA. Ir al tablero ya lo resuelve la pestaña.

## Qué se resigna

- **El botón "Ir al tablero"**, aunque la pestaña cumple la misma función.
- **El detalle de las opciones elegidas**, que queda en una línea.
- **Dos maneras de mostrar las zonas**, tarjetas y hoja, según el ancho.
