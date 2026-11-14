# 100 — Las pantallas internas de la organización llevan migas de pan

**Estado:** aceptada — 14 de noviembre de 2026. Complementa la [decisión 095](095-navegacion-del-torneo.md): la franja y sus pestañas quedan igual, y el nombre del torneo pasa a ser la última miga.

## Contexto

Al recorrer la web de la organización, el grupo encontró que en las pantallas que no están en el menú de arriba no se sabía bien dónde se estaba ni cómo volver:

- **Las pantallas del torneo** mostraban el nombre del torneo y sus pestañas, pero no de dónde se había llegado. El menú marca Inicio, y no todos lo leen como el camino de vuelta.
- **Editar el torneo no tenía vuelta al torneo:** su único botón de salida es "Volver al inicio", aunque se haya llegado desde Inscripciones.
- **Las pantallas del padrón** volvían cada una a su manera: *Importar planilla* con "← Padrón" y *Revisar vinculación* con "Padrón · para revisar".

La 095 descartó las migas *en lugar de* la franja, porque no muestran en qué momento está el torneo. Esta decisión las suma *arriba* de la franja.

## Opciones consideradas

1. **Una flecha al nivel de arriba**, "← Inicio" o "← Padrón", como ya hacían *Importar planilla* y la página en vivo ([decisión 084](084-ida-y-vuelta-a-la-pagina-en-vivo.md)).
   - En contra: muestra un solo nivel. En *Editar el torneo* hay dos (el torneo y el inicio), y la flecha tiene que elegir uno.
2. **Migas de pan**: "Inicio › Primavera 26 · Tercera › Editar", cada nivel un link.
   - En contra: es un componente nuevo, y repite lo que la franja ya dice (el nombre del torneo y la pestaña activa).
3. **"← Volver" con el historial del navegador**.
   - En contra: si se abre un link desde WhatsApp o se recarga la página, no hay a dónde volver, y el texto no dice a dónde lleva.

## Decisión

Opción 2, elegida por el grupo.

- **Dónde van:** en las pantallas del torneo, en *Editar el torneo* y en las dos del padrón que no están en el menú. No van en las de primer nivel (Inicio, Padrón, Tu circuito), que ya marca el menú, ni en las páginas públicas, que no tienen menú y vuelven con su propio link (decisión 084).
- **Qué dicen:**

  | Pantalla | Migas |
  |---|---|
  | Las cinco del torneo | Inicio › Primavera 26 · Tercera |
  | Editar el torneo, publicado | Inicio › Primavera 26 · Tercera › Editar |
  | Nuevo torneo, o un borrador | Inicio › Nuevo torneo |
  | Importar planilla | Padrón › Importar planilla |
  | Revisar vinculación | Padrón › Revisar vinculación |

- **En la franja del torneo, el nombre es la última miga** y conserva su peso de título. El tercer nivel es la pestaña activa, justo debajo: repetirlo como miga diría lo mismo dos veces en 40 px.
- **Desde *Editar el torneo* se vuelve a la categoría desde la que se llegó**, no a la primera de la convocatoria. "Editar el torneo" lo lleva en el estado de la navegación.
- **Si la pantalla tiene algo que hacer antes de irse, lo hace:** en *Editar el torneo*, una miga guarda lo pendiente antes de salir, como "Volver al inicio". Si no, el último cambio, que se guarda solo con un momento de espera, se perdería.
- **Las migas son links que siempre van al mismo lugar**, no "atrás" en el historial. El separador es el chevron del set de íconos, no un glifo.

## Por qué

- **Dicen dónde se está y a dónde vuelve cada link**, que era lo que faltaba.
- **Una sola forma de volver** en todas las pantallas internas, en lugar de tres.
- **Funcionan igual desde un link compartido o al recargar**, porque cada miga es una ruta fija.

## Qué se resigna

- **Las migas y la franja dicen en parte lo mismo:** el nombre del torneo está en las dos. Por eso en la franja el nombre es una sola cosa: título y última miga a la vez.
- **El nombre del torneo en las migas no es un link** en las pantallas del torneo. No hay una página del torneo a la que llevar: cada pestaña es una pantalla, y las pestañas están justo debajo.
- **Una fila más arriba del título** en *Editar el torneo* y en las del padrón.
