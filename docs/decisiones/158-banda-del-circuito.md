# 158 — Las páginas públicas llevan arriba una banda noche del circuito

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

Las páginas públicas (ranking, torneo, en vivo, ficha, cara a cara, proyecciones, inscripción, pago y link personal) son niebla de arriba a abajo. Arriba solo tienen una línea con el logo y el nombre del circuito, del mismo gris que todo lo demás. En la compu se ven blancas y vacías, y no se nota de quién es la página ni que es parte de algo más grande que el link que se abrió. Las pantallas del organizador, en cambio, tienen la barra noche.

[design.md](../design.md) decía que "la atmósfera vive en un solo lugar", el hero de la landing, y que el producto es claro y sobrio. Una banda oscura en las páginas públicas cambia ese principio.

## Opciones consideradas

1. **Una banda noche lisa, como la barra del organizador,** con el logo y el circuito.
   - En contra: cambia el principio de design.md, y en la página del torneo queda cerca de la tarjeta noche.
2. **La misma banda con las marcas del logo repetidas como textura.**
   - En contra: es adorno, y design.md dice que si algo aparece por adorno, algo está mal.
3. **Dejar el encabezado claro** y llenar cada página con más información.
   - En contra: no resuelve la parte de arriba, que es lo primero que se ve, y cada página lo tendría que resolver por su cuenta.

**Qué lleva la banda:**

1. **Solo el logo y el circuito, y un link "Ranking"** en las páginas de un torneo, si el circuito lo lleva.
   - En contra: no se puede ir a otros torneos del circuito.
2. **Pestañas Ranking, Torneos y Contacto.**
   - En contra: no existe una página pública con los torneos del circuito, y crearla es otra pantalla.

## Decisión

La opción 1 en las dos, elegida por el grupo.

- **La banda es `noche-900`, a todo el ancho, fuera del `<main>`,** con el contenido alineado al ancho de cada página. Lleva el logo sobre noche (que sigue siendo el link de la [decisión 157](157-el-logo-en-las-paginas-publicas.md)), el nombre del circuito y, si la página es de un torneo, su categoría o su nombre.
- **"Ranking" a la derecha** en el torneo, la inscripción y el torneo en vivo, si el circuito lleva ranking. Por eso la página del torneo deja de mostrar "← Ranking del circuito" de la [decisión 156](156-el-torneo-en-la-compu-y-su-vuelta.md): queda solo "← Inicio" para quien administra.
- **La categoría pasa a la banda** en el torneo, la inscripción y el link personal. El chip quedaba solo en una fila, en la compu.
- **La tarjeta noche del torneo no cambia:** queda separada de la banda por la niebla.
- **Las pestañas** se suman cuando exista la página de torneos del circuito, en su propio cambio.

## Por qué

- **Es la misma pieza que la barra del organizador:** no hay un lenguaje nuevo, y las páginas públicas se reconocen como Setpoint.
- **La atmósfera sigue en la landing:** la banda es una superficie lisa, sin pintura ni textura. Lo que cambia es que el noche ya no es exclusivo del organizador.
- **Una sola pieza resuelve las nueve páginas:** es el componente que ya compartían.

## Qué se resigna

- **El principio 1 de design.md pierde su forma más estricta:** ahora dice que la banda noche marca de quién es cada pantalla.
- **En el celular, la banda ocupa 56 px** que antes eran contenido, y un nombre de circuito largo se recorta si va con "Ranking" al lado.
- **En la página del torneo, la banda y la tarjeta son dos piezas noche** casi seguidas. Si al usarla pesa, la tarjeta puede pasar a papel.
