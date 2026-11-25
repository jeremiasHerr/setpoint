# 152 — El partido vencido en la página pública dice que lo resuelve la organización

**Estado:** aceptada — 25 de noviembre de 2026.

## Contexto

Un partido vence cuando pasó su fecha límite sin resultado, y se calcula al consultar ([decisión 060](060-partidos-vencidos-calculados.md)). El tablero de la organización dice "venció hace 3 días", pero la página en vivo, el link que la organización comparte en el grupo de WhatsApp, decía "a coordinar" aunque el plazo ya se hubiera cerrado: el mismo partido se mostraba de dos formas. Según el reglamento, si no se coordina, decide el Comité (02-dominio §8.4).

## Opciones consideradas

1. **Texto neutro:** "Plazo cumplido · lo resuelve la organización", en gris.
   - En contra: el mismo estado tiene dos textos, uno en el tablero y otro en la página pública.
2. **Igual que el tablero:** "venció el vie 20", en rojo.
   - En contra: deja en evidencia ante todo el circuito a quienes no coordinaron, antes de que la organización lo resuelva.
3. **Sin rótulo,** como si no hubiera pasado nada.
   - En contra: parece un dato que falta y no le avisa al jugador que el plazo se cerró.

## Decisión

Opción 1, elegida por el grupo.

- **Va solo para un partido sin fecha acordada,** sin resultado y con la fecha límite pasada. Con fecha acordada se sigue mostrando su fecha.
- **En gris de texto secundario, sin el rojo de vencido,** y en la sans: son palabras, no una cifra.
- **La API pública manda un booleano, `plazoCumplido`,** en cada partido de las zonas, del calendario y de los cuadros, con la misma cuenta que el tablero. No se agrega la fecha límite a lo que ya mandaba.
- **El tablero de la organización no cambia.**

## Por qué

- **Dice lo que pasa con el partido:** el plazo se cumplió y alguien lo va a resolver, que es lo que dice el reglamento.
- **No expone a nadie:** cada jugador ve el partido de su zona, y la página está pensada para compartirse en el grupo.
- **Una sola cuenta del plazo:** la web no vuelve a calcular nada con la fecha de su compu.

## Qué se resigna

- **El mismo estado tiene dos textos:** "venció hace 3 días" para la organización y "Plazo cumplido" para el público.
- **La página pública no dice hace cuántos días venció,** ni quién no coordinó.
