# 126 — La superficie de un partido sale de su club

**Estado:** aceptada — 22 de noviembre de 2026. Reemplaza en parte la [decisión 122](122-cara-a-cara-sin-superficie.md): el cara a cara filtra por superficie.

## Contexto

F18 pide "filtrar el rendimiento según la superficie de la cancha", y en la devolución de la entrega del 75% la cátedra volvió a sugerir el filtro. La [decisión 122](122-cara-a-cara-sin-superficie.md) lo dejó afuera porque decía que no existía el dato.

Revisando el modelo, el dato está casi entero: los clubes se cargan en *Tu circuito* con sus canchas y la superficie de cada una ([decisión 005](005-clubes-en-la-configuracion-del-circuito.md)), y el partido guarda su club al anotar la fecha (F14) y en la sede designada de las eliminatorias. Lo que nunca se guarda es la cancha: `Partido.canchaId` existe en el schema, pero ninguna pantalla la pide.

## Opciones consideradas

1. **La superficie del club:** si todas las canchas del club del partido son de la misma superficie, el partido se jugó en esa; si no, no se sabe.
   - En contra: un club con canchas de distintas superficies deja a sus partidos sin dato.
2. **Elegir la cancha al anotar la fecha.**
   - En contra: toca *Anotar fecha* en la web y en la app, y la API de F14, y obliga a volver a generar el APK a días de la entrega. Y es un paso más para el jugador, que hoy solo elige el club.
3. **Solo en las eliminatorias**, con la sede designada.
   - En contra: las zonas, que son la mayoría de los partidos, quedan afuera del filtro.

## Decisión

Opción 1, elegida por el grupo.

- `superficieDelPartido()` (`apps/api/src/modules/ficha/cara-a-cara.ts`) usa la cancha si el partido la guardó, y si no, la de su club cuando todas sus canchas coinciden. Sin club, con la sede escrita a mano o con un club sin canchas, es `null`.
- La API devuelve la superficie de cada partido y `porSuperficie`: el cruce en cada superficie con algún partido jugado, contado como el resumen (el W.O. no suma, [decisión 073](073-el-wo-no-cuenta-en-la-ficha.md)).
- En *Cara a cara*, el filtro tiene "Todas" y una opción por superficie en la que jugaron, y solo achica la lista: el panel sigue con el cruce total, como en la referencia. Abajo, una frase por superficie: *"En polvo están 2 a 2. La única vez que jugaron en cemento ganó Sanhueza."* Sin ninguna superficie conocida, no hay filtro ni frase.

## Por qué

- **No cambia ninguna pantalla de carga:** el dato ya lo da el club que eligen al anotar la fecha, y la app no necesita un APK nuevo para esto.
- **Lo habitual es que un club amateur tenga una sola superficie:** la mayoría de los partidos van a tener el dato sin que nadie haga nada.
- **Si algún día se guarda la cancha, manda la cancha:** la regla no se rehace, se completa.

## Qué se resigna

- **Los partidos en clubes con canchas de distintas superficies quedan sin dato,** y solo cuentan en "Todas".
- **Los partidos con la sede escrita a mano tampoco tienen superficie.**
- **El panel noche no cambia con el filtro:** el cruce de una superficie se lee en la frase de abajo, no en el número grande.
