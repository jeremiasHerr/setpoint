# 104 — El logo son las marcas

**Estado:** aceptada — 16 de noviembre de 2026.

## Contexto

SetPoint no tenía un logo decidido. La web mostraba un cuadrado lima con un punto negro al lado de la palabra; la app, el mismo dibujo con los colores al revés; y el APK se instalaba con el ícono por defecto de Expo. Un punto en un cuadrado no dice nada del producto, y a días de la entrega hacía falta un ícono para la app y un logo para la defensa.

Se buscó un logo plano, de un símbolo geométrico con la palabra al lado y un solo acento, que se lea a 16 px y funcione en una sola tinta.

## Opciones consideradas

1. **Dejar el punto en el cuadrado.**
   - En contra: la web y la app lo dibujaban distinto, no remite al tenis ni a los torneos, y no resuelve el ícono de la app.
2. **Un tablero con textura**, con el 5 y el 40 como dígitos encendidos.
   - En contra: sirve como ilustración, no como logo: no se puede dibujar en una tinta, a 16 px los números no se leen, y no hay forma de ponerlo al lado de la palabra.
3. **Segmentos:** la S dibujada como en un marcador de siete segmentos, con el punto en lima.
   - En contra: es un dibujo nuevo, que no está en ninguna pantalla, y se puede leer como un 5.
4. **La llave:** dos partidos que se juntan en uno y terminan en la pelota.
   - En contra: quien no sabe que es un cuadro lo lee como otra cosa, y es de las cosas que hace el producto, no la que lo distingue.
5. **Marcas:** cuatro marcas de la barra de marcas, tres hechas y la que está en juego, en lima y levantada.
   - En contra: cuatro barras son un dibujo común, que también puede leerse como señal o como gráfico.

Las exploraciones están en `docs/logos/`.

## Decisión

Opción 5, elegida por el grupo.

- **El dibujo:** en una grilla de 120, cuatro marcas de 16 × 50 con radio 4, separadas por 4. Las tres primeras van en blanco; la cuarta, en lima y 12 más arriba.
- **Sobre claro o sobre lima**, las marcas van dentro de un recuadro negro de radio 28, porque el lima sobre blanco no tiene contraste.
- **Sobre negro**, las marcas van sueltas: las tres blancas tienen el alto de la mayúscula y apoyan en la línea de base de la palabra, y la lima sobresale.
- **En una tinta**, la marca en juego se sigue distinguiendo por estar levantada.
- **La palabra** va en Instrument Sans 600 con tracking −0.03em, como hasta ahora.
- **La web y la app usan el mismo dibujo.** En la web es un SVG en línea con los tokens; en la app, cuatro `View`, para no sumar `react-native-svg` por un logo.
- **El ícono de la app** es el mismo dibujo sobre negro, sin recuadro. En el ícono adaptable de Android las marcas van a dos tercios del tamaño, porque Android recorta el lienzo.
- **Los archivos** están en `docs/logos/`: `marcas.svg` (el ícono), `marcas-logo.svg` (sobre claro) y `marcas-logo-sobre-negro.svg`. En los dos últimos la palabra está convertida a trazos, para que se vean igual sin la tipografía instalada.

## Por qué

- **Sale del producto.** La barra de marcas es el objeto gráfico central de design.md, el que ya está en el tablero, en inscripciones y en la landing. El logo es ese mismo objeto, no un dibujo aparte.
- **Dice "set point" sin una pelota ni una raqueta:** tres hechas y una en juego.
- **Aguanta el tamaño chico.** Son cuatro rectángulos: a 16 px siguen siendo cuatro rectángulos.
- **Funciona sin color**, que hace falta para el ícono monocromo de Android.
- **Una sola versión** para la web y la app.

## Qué se resigna

- **Un dibujo poco exclusivo.** Solo, sin la palabra, puede leerse como señal o como gráfico de barras.
- **No coincide del todo con la barra del producto.** Ahí la marca en curso es `--gris-400` y está a la altura de las demás; en el logo es lima y está levantada.
- **Menos lima en las pantallas claras.** El recuadro de la web pasa de lima a negro, y el lima queda en una sola marca. Es justo lo que design.md §13 tiene como decisión abierta.
- **La palabra en trazos no se actualiza sola.** Si cambia la tipografía, hay que volver a generar los dos SVG con la palabra.
- **El splash de la app sigue en blanco**, con el ícono en su recuadro.
