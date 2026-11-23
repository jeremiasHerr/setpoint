# 134 — Los primeros pasos se tildan con lo que ya hay

**Estado:** aceptada — 22 de noviembre de 2026.

## Contexto

La devolución del 25% marcó el inicio del organizador como confuso, y propuso dos cambios (devolucion-25, H1 y H2): una tarjeta **"Primeros pasos"** con tres pasos que se tildan solos (*Importá tus jugadores · Creá tu primer torneo · Compartí el link de inscripción*) y **ayuda en contexto** en lugar de un tutorial. design.md §9 los dibujaba; el código no los tenía.

Dos de los pasos se pueden saber con lo que ya hay: si el padrón tiene jugadores y si hay algún torneo. El tercero no: el sistema no registra cuándo se copia o se comparte un link.

## Opciones consideradas

Para "Compartí el link de inscripción":

1. **Se tilda con la primera inscripción pagada,** en cualquier torneo.
   - En contra: tarda en tildarse aunque el link ya se haya mandado.
2. **Se tilda al tocar "Copiar link",** guardándolo en la organización.
   - En contra: suma un campo y una migración, y copiar no es compartir.

## Decisión

Opción 1, elegida por el grupo.

- **La tarjeta sale de lo que la web ya pide para el inicio:** los jugadores del circuito, las convocatorias y los pagos de cada categoría. No cambia la API ni el schema.
- **Cada paso pendiente dice qué hacer:** "Subir la planilla", "Armar un torneo" y "Copiar link" del primer torneo con la inscripción abierta. Si no hay ninguno, lo dice.
- **Va arriba de las columnas en el inicio con torneos, y en la columna del costado en el inicio vacío,** para no competir con los dos caminos de la decisión 088. Con los tres hechos, no se muestra.
- **La ayuda en contexto se suma donde faltaba.** *Tu circuito* ya explicaba el ranking, los torneos del calendario y la participación. En *Nuevo torneo*, el formato no decía que cada zona necesita 3 inscriptos pagos para sortear (decisión 025), que es lo que después frena el cierre de la inscripción. Ahora lo dice, con la cuenta para las zonas elegidas.

## Por qué

- **Una inscripción pagada prueba que el link llegó.** Copiarlo no prueba nada.
- **Sin estado nuevo, no se desincroniza:** la tarjeta se recalcula con cada carga del inicio.

## Qué se resigna

- **El tercer paso tarda** hasta que alguien paga.
- **"Importá tus jugadores" se tilda con cualquier jugador,** también si se cargó a mano: lo que importa es que el padrón no esté vacío.
