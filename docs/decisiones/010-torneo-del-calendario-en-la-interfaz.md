# 010 — "Torneo del calendario" y "edición" en la interfaz

**Estado:** aceptada — octubre de 2026. Surge de la devolución del 25% ([devolucion-25.md](../devolucion-25.md), cambio D). Pendiente de código: solo textos de la web.

## Contexto

El modelo tiene `Etapa` (el torneo que se repite cada año y define un casillero del ranking: Primavera, Verano…) y `Torneo` (una categoría de una convocatoria: Primavera 26 · Tercera). "Etapa" es el término del reglamento de POLENTA y la interfaz lo mostraba tal cual: "Etapas del calendario", "Puntos por etapa".

En la verificación del 25% el profesor dijo que el proyecto era confuso y parecía hecho a medida de POLENTA. "Etapa" es parte de eso: fuera de POLENTA suena a fase de un torneo (grupos, cuadros), no a un torneo que vuelve cada año.

## Opciones consideradas

1. **Renombrar en todas las capas**: `Etapa` → `TorneoCalendario` en el schema, la API, el código y los documentos.
   - En contra: migración, cambios en los tres workspaces y en `packages/shared`, y reescribir buena parte de la documentación, sin cambiar ningún comportamiento. Y `Torneo` seguiría chocando con el nombre nuevo.
2. **Renombrar solo en la interfaz**: "Etapa" se muestra como "torneo del calendario", y como `Torneo` ya existe y es otra cosa, en la interfaz pasa a mostrarse como "edición". Código, base y API quedan igual.
   - En contra: el código y la pantalla usan nombres distintos para lo mismo. Hace falta un glosario, y quien lea el código tiene que conocerlo.
3. **Dejar "Etapa"** y explicarla con ayuda en contexto.
   - En contra: no responde a la crítica. El término sigue siendo de POLENTA.

## Decisión

Opción 2. En la interfaz:

- `Etapa` → **torneo del calendario**: *"El Primavera es un torneo del calendario."*
- `Torneo` → **edición**: *"Primavera 26 · Tercera es una edición."*

En código, base de datos y API **no se renombra nada**. La equivalencia está en [02-dominio.md](../02-dominio.md) §0 y el vocabulario de la interfaz en [design.md](../design.md) §9.

## Por qué

- **El problema era de nombres para el usuario, no de estructura.** El modelo de `Etapa` y `Torneo` es correcto; lo que confundía era cómo se mostraba.
- **Cuesta textos, no una migración.** Son unas diez cadenas en la web (listadas en [pantallas/README.md](../pantallas/README.md)) contra tocar el schema, la API, los tres workspaces y los documentos.
- **"Torneo del calendario" dice lo que es** sin conocer el reglamento: un torneo que está en el calendario anual y se repite. "Edición" es como se habla de un torneo que vuelve cada año.
- **Separar código e interfaz ya es la práctica del proyecto:** el estado del torneo se llama `ELIMINATORIAS` en el enum y "cuadros" en la pantalla.

## Qué se resigna

- **Un solo nombre por concepto.** Código y pantalla dicen cosas distintas, y el glosario hay que mantenerlo.
- **Choque con `Torneo.edicion`.** Ese campo ya existía ([decisión 003](003-torneo-con-varias-categorias.md)) y nombra la **convocatoria completa** ("Primavera 2026", todas las categorías). En la interfaz, "edición" es en cambio **un** `Torneo`, una categoría. No se renombra el campo, pero queda advertido en el glosario.
- **Quedan casos sin nombre cerrado** (decisión abierta 15 del [README](../README.md)): cómo se muestra un torneo suelto, que no pertenece a ningún torneo del calendario ("edición" de qué), y cómo se llama en *Nuevo torneo* la convocatoria que crea varias ediciones a la vez.
