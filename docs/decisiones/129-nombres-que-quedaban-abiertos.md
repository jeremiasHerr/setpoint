# 129 — Los nombres que quedaban abiertos: "Campeonato" queda, "Padrón" pasa a "Jugadores" y la convocatoria es "torneo"

**Estado:** aceptada — 22 de noviembre de 2026. Cierra las decisiones abiertas 15 y 16 del [README](../README.md) y el término "Padrón" de [devolucion-25.md](../devolucion-25.md) §3.1.

## Contexto

La devolución del 25% pidió términos genéricos en la interfaz ([devolucion-25.md](../devolucion-25.md) §3.1). Ya se resolvieron "torneo del calendario", "edición" ([decisión 010](010-torneo-del-calendario-en-la-interfaz.md)) y el nombre configurable del cuadro consuelo ([decisión 120](120-nombre-del-cuadro-consuelo.md)). Quedaban tres:

- **Abierta 15:** cómo se llaman el torneo suelto y la convocatoria que crea varias categorías a la vez (en código, `Torneo.edicion`).
- **Abierta 16:** si "Campeonato" pasa a "cuadro principal", configurable como el consuelo.
- **"Padrón"** en el menú, que se entiende pero suena administrativo.

## Opciones consideradas

**Abierta 16**

1. **Dejar "Campeonato".**
   - En contra: es el término de POLENTA para su cuadro principal.
2. **"Cuadro principal", fijo.**
   - En contra: toca las pantallas y los textos que hoy dicen Campeonato, sin que nadie lo pida.
3. **Configurable, como el consuelo.**
   - En contra: un campo nuevo en la organización y en *Tu circuito* para un nombre que no varía entre circuitos.

**"Padrón"**

1. **Dejarlo.**
   - En contra: la devolución lo marcó.
2. **"Jugadores" en el menú, las migas y el título de la pantalla.**
   - En contra: en las frases sigue apareciendo "padrón" ("se anota cualquiera del padrón").

**Abierta 15**

1. **Documentar lo que ya dice la interfaz:** la convocatoria es un "torneo" (la pantalla es *Nuevo torneo*), cada categoría se ve como "Primavera 26 · Tercera", y el que no es del calendario es un "torneo suelto".
   - En contra: "torneo" nombra tanto la convocatoria como cada categoría.
2. **Un nombre nuevo para la convocatoria**, como "convocatoria".
   - En contra: es un término administrativo, de los que la devolución pidió sacar, y cambia *Nuevo torneo*.

## Decisión

Elegidas por el grupo:

- **"Campeonato" queda** (opción 1 de la 16). Es el término habitual del tenis amateur para el cuadro de los que clasifican, no algo propio de POLENTA como "Complementaria". `NOMBRE_DEL_PRINCIPAL` sigue en `apps/web/src/features/cuadros/cuadro.ts`, por si algún día cambia.
- **"Padrón" pasa a "Jugadores"** en el menú del organizador, las migas de pan y el título de la pantalla, también en la demo de la landing. La ruta sigue siendo `/padron` y el código no cambia. En las frases, "padrón" se mantiene donde se habla de la lista del circuito.
- **La convocatoria es un "torneo"** y el que no es del calendario, un "torneo suelto" (opción 1 de la 15). Es lo que ya dicen *Nuevo torneo* y el inicio; no cambia ninguna pantalla.

## Por qué

- **Los tres son el texto más corto que se entiende sin explicación.** Nadie en un club dice "convocatoria" ni "cuadro principal"; "torneo" y "Campeonato" sí.
- **"Jugadores" es lo que la organización busca en el menú**: la lista de jugadores de su circuito.
- **Ningún cambio toca el código ni los datos**: son textos.

## Qué se resigna

- **"Torneo" nombra dos cosas**: la convocatoria y cada categoría. En las pantallas se distinguen por el nombre ("Primavera 26" contra "Primavera 26 · Tercera").
- **Conviven "Jugadores" en el menú y "padrón" en algunas frases.**
- **Un circuito que llame distinto a su cuadro principal no lo puede cambiar.**
