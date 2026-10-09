# 011 — La importación detecta los torneos del calendario y las categorías

**Estado:** aceptada — octubre de 2026. Surge de la devolución del 25% ([devolucion-25.md](../devolucion-25.md), cambio E). Pendiente de código.

## Contexto

La importación del padrón (F03, [decisión 009](009-importacion-extraccion-completa-con-ia.md)) necesita que el circuito tenga sus etapas configuradas: arma el schema de respuesta con ellas (`z.enum`) y, si no hay ninguna, termina en error (`SIN_ETAPAS`). La categoría se elige a mano en cada subida.

Eso obliga a una organización con datos previos a configurar en *Tu circuito* lo que su planilla ya dice (las columnas son los torneos del calendario; el título de la hoja, la categoría) antes de poder importarla. Y toda organización arranca sin etapas, porque el registro no las pide ([07-configurabilidad.md](../07-configurabilidad.md) §1).

El profesor dijo que la IA no lo convencía y que lo ideal es que sea todo automático.

## Opciones consideradas

1. **Mantener la configuración previa obligatoria.** Primero *Tu circuito*, después importar.
   - En contra: la organización tipea dos veces lo que está en el archivo, y la primera experiencia con la IA empieza con un error si no lo hizo.
2. **Detectarlos con la IA y crearlos al confirmar.** Sin torneos del calendario configurados, la importación los lee de los encabezados y los propone en orden. Si ya hay, usa los existentes y propone como nuevo lo que no coincide. Las categorías salen del título de la hoja o del nombre del archivo. Todo se crea al confirmar, en la misma transacción que los jugadores.
   - En contra: el schema de respuesta deja de restringir la etapa a una lista cerrada, y ese control pasa a la auditoría. Más superficie para un error del modelo, como un nombre de torneo mal leído.
3. **Detectarlos con código** (encabezados con nombres de estación y un año).
   - En contra: es el mapeo de columnas que la decisión 009 descartó por frágil. "PRETEMP", "Ver 25/26" y "ETAPA INVIERNO 26" ya serían tres casos.

## Decisión

Opción 2.

- **Sin torneos del calendario configurados**, `etapa` pasa de `z.enum` a `string` en el schema de respuesta, y se agrega `etapasDetectadas` (nombre y orden).
- **La auditoría verifica** que todos los jugadores usen las mismas etapas y que cada una esté entre las detectadas o las configuradas.
- **Los nuevos se confirman una vez, como estructura** (*"Detectamos 5 torneos en tu planilla: Primavera, Verano… ¿Los creamos?"*), no fila por fila. Se crean en la misma transacción que la importación; si se descarta, no queda nada.
- **Encabezados que cruzan de año** ("VERANO 25/26"): *propuesto*, cuenta **el año en que termina**. Es lo que el eval ya espera, y con la [decisión 008](008-fecha-de-los-movimientos-importados.md) deja el movimiento fechado dentro de la temporada que representa.
- *Propuesto:* si la importación trae puntos, confirmarla enciende `usa_ranking`.
- Prompt `importacion-v2` y un caso nuevo en el eval: planilla sin etapas ni padrón.

## Por qué

- **La planilla ya es la configuración.** Pedirla de nuevo a mano es el tipo de trabajo que la importación existe para evitar. Con esto, una organización con datos previos sube su archivo y el circuito queda configurado.
- **Es lo que la IA resuelve bien y el código no**, por la misma razón que en la decisión 009: los encabezados reales no siguen un formato.
- **El riesgo se cubre igual que con los números:** la auditoría verifica la coherencia, y la persona confirma la estructura una vez. Un torneo del calendario mal creado es más caro de corregir que un jugador, por eso es lo único que siempre pide confirmación.

## Qué se resigna

- **La restricción de forma en la capa 2.** Con etapas configuradas, el modelo no podía devolver una inexistente; sin ellas, eso lo controla la auditoría (capa 4), después de la llamada.
- **Simplicidad del prompt y del schema**, que pasan a tener dos modos (con y sin calendario configurado).
- **Nombres "como los escribió la planilla".** Si el archivo dice "PRETEMP", el torneo se propone con el nombre que el modelo interprete ("Pretemporada"); la organización lo puede corregir al confirmar o después, en *Tu circuito*.
