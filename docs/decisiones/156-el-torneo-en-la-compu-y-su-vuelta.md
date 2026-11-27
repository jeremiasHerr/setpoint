# 156 — En la compu, el torneo va en dos columnas, y vuelve al Inicio o al ranking

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

La página del torneo (`/inscripcion/:organización/:torneo`, la que abre el link que se comparte) era una columna de 480 px en cualquier pantalla: en la compu parecía un celular en el medio de la pantalla. Además no tenía cómo salir: es pública, sin menú, y quien llega desde WhatsApp no tiene historial al que volver. Quien la abre desde su Inicio para revisarla, la organización, quedaba sin vuelta.

## Opciones consideradas

**A dónde vuelve:**

1. **Según quién la mira:** quien administra ese circuito, al Inicio; los demás, al ranking del circuito, si lo lleva.
   - En contra: la página lee la sesión, que hasta ahora no le importaba.
2. **Siempre al ranking del circuito.**
   - En contra: la organización, que es quien más abre la página desde la compu, no vuelve a su Inicio.
3. **Siempre al Inicio.**
   - En contra: un jugador sin cuenta cae en el ingreso.

**Cómo se ve en la compu:**

1. **Dos columnas:** la tarjeta del torneo a la izquierda, y el precio, el botón y los contactos a la derecha, fijos al bajar.
   - En contra: la página tiene dos diseños para mantener.
2. **Una columna más ancha,** con los datos en una fila.
   - En contra: a 1440 px sigue sobrando la mitad de la pantalla.

## Decisión

Las opciones 1, elegidas por el grupo.

- **Vuelta:** si en el navegador hay una sesión de administrador de esa misma organización, "← Inicio". Si no, "← Ranking del circuito" cuando la organización lleva ranking, y nada cuando no. La API suma `usaRanking` a la organización del torneo público para saberlo.
- **Desde 1024 px, dos columnas** en el ancho de 1040 px del ranking y la ficha ([decisión 155](155-ranking-y-ficha-en-la-compu.md)). En la tarjeta, las fechas y el formato pasan a tres columnas, con el rótulo arriba, porque a lo ancho quedaban lejos de su dato.
- **Debajo de 1024 px no cambia nada.**

## Por qué

- **Cada uno vuelve a lo suyo:** la organización a su Inicio y el jugador a lo único público del circuito entero, que es el ranking. La sesión se lee del navegador, sin pedirle nada a la API.
- **En la compu, lo que se viene a hacer queda a la vista** al lado de lo que es el torneo, sin bajar.
- **Mismo ancho que las otras páginas públicas,** así no saltan al pasar de una a otra.

## Qué se resigna

- **Un circuito sin ranking no tiene vuelta para el jugador:** no hay otra página pública del circuito.
- **Dos diseños de la página** para mantener, como en la 155.
- Un administrador de otra organización que abre el link ve la vuelta al ranking, no a su Inicio.
