# 117 — Las proyecciones no son IA, y F19 pasa a ser la segunda funcionalidad de IA

**Estado:** aceptada — 19 de noviembre de 2026.

## Contexto

La lista de funcionalidades contaba dos funcionalidades asistidas por IA confirmadas, la importación de la planilla (F03) y las proyecciones de ranking (F20), más una condicionada, los resultados desde los mensajes (F19).

Las proyecciones dicen cuántos puntos sumaría un jugador y en qué puesto quedaría según hasta dónde llegue en el cuadro. Es aplicar la tabla de puntos, reemplazar el casillero del torneo del calendario y volver a ordenar el ranking: una cuenta exacta. La API ya las calcula así, sin llamar a ningún modelo (PR #133).

La cátedra exige que la IA sea funcionalidad de la aplicación, y en la devolución del 25% el profesor dijo que la IA no lo convenció.

## Opciones consideradas

1. **Sacar las proyecciones de la IA y priorizar F19** como la segunda funcionalidad de IA.
2. **Sumarles a las proyecciones una explicación escrita por un modelo** ("si llegás a semis, pasás al cuarto puesto").
   - En contra: el modelo solo redactaría lo que la cuenta ya dice, con riesgo de que se equivoque en un número. Sería IA puesta para cumplir.
3. **Dejarlas como IA en la documentación.**
   - En contra: no es cierto, y una etiqueta forzada empeora lo que el profesor ya criticó.

## Decisión

Opción 1, elegida por el grupo.

- **F20 deja de ser una funcionalidad asistida por IA.** Sigue en el alcance como una cuenta exacta: la API está, falta la pantalla.
- **F19 pasa a prioridad alta** como la segunda funcionalidad de IA. El alcance se confirma con el profesor (decisión abierta 14).

## Por qué

- **La IA va donde aporta algo que una cuenta no puede:** entender una planilla escrita de cualquier forma (F03) y entender un mensaje de WhatsApp escrito en lenguaje libre (F19).
- **F19 es la IA del uso diario.** Cargar resultados es la tarea que se repite todas las semanas, y es la respuesta más directa a "lo ideal es que sea todo automático". Reutiliza la arquitectura de la importación: lo que pasa los controles se carga solo y lo dudoso lo confirma la organización.

## Qué se resigna

- **Hasta que F19 esté, hay una sola funcionalidad con IA,** la importación.
- **F19 compite por tiempo** con lo que falta para la entrega: la app, el APK y la pantalla de las proyecciones.
