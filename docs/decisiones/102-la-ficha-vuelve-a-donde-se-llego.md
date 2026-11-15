# 102 — La ficha del jugador vuelve a la página desde la que se llegó

**Estado:** aceptada — 14 de noviembre de 2026.

## Contexto

La [decisión 100](100-migas-de-pan.md) dejó las migas para las pantallas de la organización. Las páginas públicas no tienen menú y vuelven con su propio link, "← …", como la página en vivo ([decisión 084](084-ida-y-vuelta-a-la-pagina-en-vivo.md)). Al revisar dónde más faltaba una vuelta, aparecieron dos páginas sin ella:

- **La ficha del jugador no tenía ninguna.** Se llega desde el ranking y desde las zonas del torneo en vivo ([decisión 074](074-entrada-a-la-ficha.md)), y la única salida era el botón del navegador.
- **La inscripción no volvía a la página del torneo** en el paso del email. "Volver al torneo" aparecía recién más adelante, al buscarse en el padrón.

La inscripción tiene una sola página arriba, y suma "← El torneo" como la página en vivo. La ficha tiene dos.

## Opciones consideradas

1. **"← Ranking" siempre**, o "← El torneo en vivo" si el circuito no lleva ranking.
   - En contra: quien llegó desde el torneo en vivo vuelve al ranking, y no se sabe a qué torneo volver sin ranking.
2. **Volver a la página desde la que se llegó**: "← Ranking" o "← Primavera 2026 · Tercera en vivo". Si se abre desde un link compartido, vuelve al ranking.
   - En contra: la misma ficha muestra una vuelta distinta según cómo se abrió.
3. **Migas públicas**, "Ranking › Juan Pérez".
   - En contra: la 100 dejó las flechas para las páginas públicas, y con dos páginas arriba las migas tienen que elegir una igual.

## Decisión

Opción 2, elegida por el grupo.

- **El link a la ficha dice a dónde volver**, en el estado de la navegación: la ruta y el texto. El ranking manda su ruta con la categoría; las zonas, la página en vivo con la pestaña Zonas y el nombre del torneo.
- **Sin ese estado** (un link compartido, otra pestaña), vuelve al ranking si el circuito lo lleva. Si no lo lleva, la ficha no muestra flecha: no hay una página del circuito a la que volver.
- **La categoría del ranking queda en la URL** (`?categoria=`), como la pestaña de la página en vivo (`?ver=`). Si no, la vuelta abría siempre en la primera categoría, aunque se hubiera llegado desde otra.
- **Es la misma flecha en las tres páginas** (en vivo, ficha e inscripción): un link a una ruta fija, arriba del título.

## Por qué

- **Lo más común es mirar la ficha de un rival desde el torneo en vivo** y querer volver a las zonas, no al ranking.
- **Cada vuelta sigue siendo una ruta fija**, como pide la 100: la ruta viaja con el link, y no depende del historial del navegador.

## Qué se resigna

- **La vuelta de la ficha depende de cómo se abrió:** desde un link compartido dice "← Ranking" aunque quien la compartió la haya abierto desde un torneo.
- **El ranking sin categoría en la URL sigue abriendo en la primera con jugadores**, como antes. Desde un link compartido, la ficha vuelve ahí, no a la categoría del jugador.
