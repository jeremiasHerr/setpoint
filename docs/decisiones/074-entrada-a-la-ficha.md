# 074 — A la ficha del jugador se llega desde el ranking y desde las zonas del torneo en vivo

**Estado:** aceptada — 7 de noviembre de 2026

## Contexto

La ficha pública del jugador (F17) vive en `/c/:slug/jugadores/:id`, sobre `GET /api/publico/:slug/jugadores/:id`, junto a las otras consultas sin login ([decisión 033](033-ranking-publico.md)). Hasta ahora ninguna pantalla pública llevaba a un jugador: sin una entrada, en la demo no se llega a la ficha. F18 dice que el cara a cara se abre desde la ficha o desde un buscador por apellido, pero eso llega con el 100%.

El `id` es el número del perfil del padrón, que el ranking público ya devuelve en cada fila.

## Opciones consideradas

1. **Desde el ranking y desde las zonas del torneo en vivo:** "Ver la ficha" en la fila abierta del ranking, y el nombre de cada jugador en las tablas de *Zonas*.
   - En contra: toca dos pantallas que ya existen.
2. **Solo desde el ranking.**
   - En contra: en un circuito sin ranking, como Liga Amateur del Valle, no hay forma de llegar.
3. **Desde todo nombre público:** ranking, zonas, cuadros y calendario.
   - En contra: toca cinco o seis componentes en un solo cambio.

## Decisión

Opción 1, elegida por el grupo.

- **Ranking público** (`TablaRanking`): al tocar una fila, debajo de los casilleros aparece "Ver la ficha". La nota del pie lo dice.
- **El torneo en vivo, pestaña Zonas** (`ZonasEnVivo`): el nombre de cada jugador de la tabla es un enlace a su ficha.
- **Quién tiene ficha:** los jugadores del padrón que juegan hoy, como en el ranking. Un perfil pendiente, descartado o dado de baja, o el de otra organización, responde 404 y la página dice "No encontramos a ese jugador".
- **El puesto y las barras** son de la categoría en la que juega hoy y salen de la misma tabla que el ranking público, para que las dos pantallas digan lo mismo.

## Por qué

- **Son los dos lugares donde se mira a un jugador:** en el ranking, para ver cómo viene; en las zonas, para ver contra quién se juega.
- **Llega cualquier circuito:** con ranking, desde la tabla; sin ranking, desde sus torneos.
- **El id no expone nada nuevo:** el ranking público ya lista a todo el padrón con su id, y la ficha no tiene datos de contacto.

## Qué se resigna

- **Los cuadros, el calendario y los rivales dentro de la ficha no enlazan.** Se suman cuando haga falta, de a una pantalla.
- **Un jugador dado de baja no tiene ficha,** aunque su nombre siga en las zonas de un torneo viejo: el enlace lleva a "No encontramos a ese jugador".
- **La app todavía no tiene la ficha.** El historial en el celular que pide F11 queda pendiente.
