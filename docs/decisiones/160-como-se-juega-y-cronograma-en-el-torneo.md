# 160 — La página del torneo dibuja el formato y muestra el cronograma

**Estado:** aceptada — 27 de noviembre de 2026.

## Contexto

La página pública del torneo decía el formato en una línea, "8 zonas de 4 · dos cuadros", que se entiende solo si ya jugaste el circuito. No decía hasta cuándo son las zonas ni cuándo es la final, aunque el reglamento pide anunciar el cronograma al convocar ([02-dominio.md](../02-dominio.md) §8.1) y la organización ya lo carga en *Nuevo torneo*. En la compu, además, abajo de la tarjeta quedaba un espacio vacío.

## Opciones consideradas

**Qué fechas muestra el cronograma:**

1. **Las de las zonas, y las rondas con su plazo:** "Zonas del 14/12 al 3/1", "Octavos a semis, una semana cada ronda", "Final, semana del 25/1, estimada".
   - En contra: no dice la semana de cada ronda.
2. **Todas las fechas, calculadas.**
   - En contra: una ronda que se atrasa o un plazo extendido corren todo lo que viene, y la página queda diciendo fechas que ya no son.
3. **Solo los plazos, sin fechas.**
   - En contra: no responde "¿hasta cuándo son las zonas?".

**Dónde van en el celular:**

1. **Después del botón de inscribirse.**
2. **Antes del botón.**
   - En contra: el botón baja casi dos pantallas.

## Decisión

Las opciones 1, elegidas por el grupo.

- **"Cómo se juega":** las zonas con sus marcas en los colores de cada cuadro (ámbar el Campeonato, petróleo el consuelo, gris los que terminan en la zona si no hay consuelo), cuántos van a cada cuadro, y "jugás al menos N partidos". El consuelo va con el nombre que le da el circuito.
- **"Cronograma":** inscripción, sorteo, zonas, las rondas antes de la final y la final, con la fase en la que está el torneo marcada.
- **Las cuentas son las de *Nuevo torneo*:** `calcularFormato` de `packages/shared`, que ya está probada. No hay una segunda forma de contar rondas ni fechas.
- **La API suma a `TorneoPublico`** los clasificados por zona, los dos plazos, el nombre del cuadro consuelo y la fase (inscripción, sorteo, zonas, cuadros o terminado), que sale del estado del torneo.
- **En la compu, debajo de la tarjeta;** en el celular, después del botón y antes de los contactos.

## Por qué

- **Es lo que más se pregunta en el grupo** cuando se anuncia un torneo: cómo se juega y hasta cuándo.
- **El dibujo explica el torneo a quien llega de afuera,** en los modos con aprobación y abierto, sin un párrafo.
- **Las fechas que se muestran no se mueven:** las de las zonas salen del inicio y su plazo; lo que depende de cómo avancen las rondas se dice como plazo.

## Qué se resigna

- **Con los cuadros en juego, la marca no sabe la ronda:** queda en el paso de las rondas aunque se esté jugando la final. Saberlo pedía calcular las rondas jugadas en la API.
- **El dibujo muestra el formato publicado:** si no se llena el cupo y quedan zonas de 3, se ve con zonas de 4 hasta que se sortea.
- **La final dice una semana estimada,** que puede quedar en el pasado si el torneo se atrasa.
