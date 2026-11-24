# 143 — En la app, la ficha compara con quienes jugó y filtra sus partidos

**Estado:** aceptada — 23 de noviembre de 2026.

## Contexto

En la app, el cara a cara (F18) era solo *Cómo te fue con…*: el historial entre quien tiene la sesión y un rival. Se abría desde el próximo partido o desde la ficha de otro jugador. Desde una ficha no se podía comparar a ese jugador con un tercero, y desde la propia no se podía comparar con nadie.

La lista de partidos de la ficha (F17) tampoco tenía filtros: mostraba los últimos cinco y el resto se desplegaba.

La cátedra sugirió las dos cosas: comparar desde cualquier perfil contra otros jugadores, y filtrar los partidos de la ficha por ganados o perdidos y buscar por el apellido del rival.

La única decisión abierta era con quién se puede comparar.

## Opciones consideradas

1. **Solo con quienes jugó**, de la lista de sus rivales y con un buscador por apellido. Es lo que hace la web ([decisión 122](122-cara-a-cara-sin-superficie.md)).
   - En contra: no se compara a dos que nunca se enfrentaron.
2. **Con cualquiera del circuito.**
   - En contra: casi siempre daría "Todavía no jugaron entre ellos". Además pide un endpoint nuevo para listar a los jugadores, porque un circuito sin ranking no tiene una lista pública.

## Decisión

Opción 1, elegida por el grupo.

- **"Comparar con otro jugador" en cualquier ficha,** también la propia. Abre *Comparar* (`/comparar/[id]`): la lista de con quiénes jugó, de más a menos partidos, con un buscador por apellido que no distingue tildes. Usa la ruta pública que ya existía, `GET /api/publico/:slug/jugadores/:id/rivales`.
- **El cara a cara acepta dos jugadores cualesquiera:** `/rival/[id]?de=<jugador>`. Sin `de`, o con el jugador de la sesión, sigue siendo *Cómo te fue con…*, con "Ganaste". Entre otros dos, el título es "Sanhueza y Roa" y cada partido dice quién lo ganó.
- **En la ficha, los partidos se filtran** con los chips Todos, Ganados y Perdidos, y con un buscador por el apellido del rival. Mientras hay un filtro, se ven todos los que coinciden y no solo los últimos cinco.
- **Tocar un partido de la ficha abre el cara a cara con ese rival.**
- Los filtros se calculan en el celular con los partidos que ya trae la ficha: la API no cambia.

## Por qué

- **Es lo que ya hace la web,** y en la app se reutiliza la misma ruta. No hace falta nada nuevo en la API.
- **Compararse con alguien con quien nunca jugó no muestra nada.** Lo que tiene datos para mostrar es el historial con un rival.
- **Tocar un partido es el camino más corto** para ver el cruce con alguien que ya está en la lista.

## Qué se resigna

- **No se compara a dos que nunca se enfrentaron,** ni se elige un jugador que no esté en la lista de rivales.
- **La web no suma los filtros de la ficha:** la sugerencia era para la app, y cada pantalla va en su PR.
