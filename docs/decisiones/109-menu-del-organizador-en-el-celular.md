# 109 — En el celular, el menú del organizador va en un panel

**Estado:** aceptada — 18 de noviembre de 2026.

## Contexto

El encabezado de la organización tiene en una fila el logo, el nombre de la organización, el menú (Inicio, Circuito, Padrón), las iniciales y "Salir". A 375 px no entra: solo el lado derecho mide 318 px, y el espacio útil es de 319. El menú tapaba el logo y "Salir" quedaba cortado, en todas las pantallas de la organización.

design.md reparte el producto entre la compu del organizador y el celular del jugador. Pero la web tiene que funcionar en cualquier ancho, y un organizador también la abre desde el celular para revisar algo.

## Opciones consideradas

1. **Dos filas debajo de 640 px:** arriba el logo, la organización, las iniciales y Salir; abajo el menú.
   - En contra: el encabezado pasa de 60 a unos 100 px, el nombre de la organización queda recortado y las dos filas lo cargan.
2. **Un botón "Menú" que abre un panel** con las secciones y Salir.
   - En contra: un componente con su propia interacción (abrir, cerrar, foco), y cada sección queda a un toque más.
3. **Una sola fila apretada:** la marca sin la palabra, sin el nombre de la organización, y Salir dentro de las iniciales.
   - En contra: no se ve de qué organización es la sesión, y Salir queda escondido.

Las dos primeras se compararon sobre el encabezado real, a 375.

## Decisión

Opción 2, elegida por el grupo.

- **Desde 768 px el encabezado no cambia.** Debajo, el menú, las iniciales y Salir se reemplazan por el botón "Menú", que dice "Cerrar" mientras está abierto. El corte es 768 y no 640 porque la fila completa mide unos 650 px.
- **El panel baja debajo del encabezado, en `noche`:** las secciones en filas de 48 px, la activa en `noche-2`; abajo, separadas por una línea, las iniciales con el nombre completo de la organización, y Salir.
- **Detrás, el velo del modal de confirmación:** `noche` al 40 %, desenfocado.
- **Se cierra con Escape, tocando el velo, con "Cerrar" o al elegir una sección.** Al abrir, el foco va a la primera sección; con Escape vuelve al botón.

## Por qué

- **La fila queda limpia y del mismo alto que en la compu**, con el nombre de la organización a la vista.
- **Las áreas de toque son de 48 px**, en lugar de los links de 34 de la barra.
- **Es un solo componente**, el encabezado, así que llega a todas las pantallas de la organización sin tocar ninguna.

## Qué se resigna

- **Un toque más** para cambiar de sección desde el celular.
- **Una interacción más para mantener:** el foco y el cierre del panel son código propio, no del navegador.
