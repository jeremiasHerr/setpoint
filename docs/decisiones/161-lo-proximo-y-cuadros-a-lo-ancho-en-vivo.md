# 161 — El torneo en vivo muestra lo próximo y reparte los cuadros chicos a lo ancho

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

El torneo en vivo es el link que la organización comparte en el grupo. En los cuadros, con semis y final, las tarjetas miden 190 px haya las rondas que haya: a 1440 px los dos cuadros ocupaban menos de la mitad del ancho, y el marcador de cada partido decía "2 / 0" hasta tocarlo. Y lo que todos buscan cuando se acerca una final, cuándo y dónde se juega, había que buscarlo en la pestaña Calendario.

## Opciones consideradas

**Los cuadros en la compu:**

1. **Con pocas rondas, repartir el ancho** y mostrar en cada tarjeta el nombre completo y el marcador set por set.
   - En contra: dos tamaños de tarjeta para mantener.
2. **Dejarlos de 190 px.**
   - En contra: la mitad de la pantalla vacía en la parte del torneo que más se mira.

**Arriba de las pestañas:**

1. **Una pieza con lo que viene:** en los cuadros, la ronda que se está jugando; en las zonas, los próximos partidos con fecha.
2. **Nada:** está en Calendario.
   - En contra: Calendario no dice cuál es la ronda en curso, y hay que entrar a buscarlo.

**Su nombre:**

1. **"Lo próximo".**
2. **"Próxima etapa".**
   - En contra: en POLENTA "etapa" es el torneo del calendario ([decisión 010](010-torneo-del-calendario-en-la-interfaz.md)), y "próxima etapa" en la página de Primavera 26 se lee como "Verano". En las zonas, además, lo que muestra no es una etapa.
3. **"Próxima ronda".**
   - En contra: en las zonas no hay rondas.

## Decisión

Las opciones 1, elegidas por el grupo.

- **Cuadros de hasta 3 rondas (8 jugadores):** en la compu se reparten el ancho en partes iguales, y cada tarjeta muestra nombre y apellido y los games de cada set, sin tocarla. Con 4 rondas o más quedan como antes: los sets no entran. `CuadroCompleto` y `TarjetaPartido` suman la opción; Cargar resultado, que usa el mismo cuadro, no cambia.
- **"Lo próximo"**, en papel, arriba de las pestañas:
  - **En los cuadros,** los partidos de la ronda en curso de cada cuadro que ya tienen a sus dos jugadores, con fecha, hora y sede, o "a coordinar". El título dice la ronda ("La final", "Las finales", "Las semis") si todos los cuadros están en la misma; si no, "Los próximos partidos".
  - **En las zonas,** los próximos 4 partidos con fecha.
  - **Sin nada por jugarse, no aparece.**
- **No cambia la API:** usa los cuadros y el calendario que la página ya pide.

## Por qué

- **Es lo que se busca al abrir el link:** cuándo se juega lo que falta.
- **El cuadro se lee como el de un torneo de verdad:** con nombres completos y el marcador a la vista, ya no hace falta "Tocá cualquier partido para ver el marcador".
- **En papel:** la banda noche ya está arriba ([decisión 158](158-banda-del-circuito.md)), y dos piezas noche seguidas pesaban demasiado.

## Qué se resigna

- **Dos tamaños de tarjeta de cuadro,** según las rondas.
- **Con el torneo terminado, "Lo próximo" desaparece:** mostrar a los campeones queda para otro cambio.
- **En las zonas solo aparecen los partidos con fecha anotada:** los que están por coordinar no tienen nada que mostrar todavía.
