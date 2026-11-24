# 146 — Los buscadores de jugadores buscan por nombre y apellido

**Estado:** aceptada — 24 de noviembre de 2026. Reemplaza en parte a la [decisión 051](051-vinculacion-con-el-padron.md) (la primera vez, el jugador se buscaba por su apellido) y a la [143](143-comparar-y-filtrar-en-la-ficha-de-la-app.md) (los buscadores de la app eran por apellido).

## Contexto

Los buscadores de jugadores pedían el apellido: Inscripciones, Inscribir a mano, Jugadores y el ranking público en la web; la inscripción del jugador la primera vez; y Comparar y los partidos de la ficha en la app. Al probarlos, el grupo encontró que no tenía sentido: quien busca a alguien escribe el nombre con el que lo conoce, que muchas veces es el de pila, o los dos.

Cada pantalla además comparaba a su manera. El padrón ya buscaba en el nombre completo aunque dijera "apellido", el resto solo en el apellido, y la web y la app tenían cuatro copias de la misma función para sacar las tildes. La API de la inscripción ya comparaba palabra por palabra contra el nombre completo; solo el texto de la pantalla pedía el apellido.

## Opciones consideradas

1. **Por apellido, como estaba.**
   - En contra: "Juan" no encuentra a nadie, y los apellidos compuestos o con tilde dependen de cómo los cargó la organización.
2. **El nombre completo como un solo texto:** lo escrito tiene que aparecer seguido en "Juan Pérez".
   - En contra: "pérez juan" no encuentra a Juan Pérez, y quien tiene dos nombres no aparece si se escribe solo el primero y el apellido.
3. **Palabra por palabra:** cada palabra escrita tiene que estar dentro de alguna del nombre completo, en cualquier orden.
   - En contra: un nombre de pila común trae a varios, hasta que se escribe algo del apellido.

## Decisión

Opción 3, pedida por el grupo.

- **Una sola función en `packages/shared`,** `coincideConElNombre`, que usan la web y la app. Compara sin tildes ni mayúsculas, y cada palabra escrita tiene que estar dentro de alguna del nombre o del apellido: "juan pe" y "pérez juan" encuentran a Juan Pérez.
- **Los rótulos dicen "nombre o apellido",** y la inscripción del jugador pide "tu nombre y apellido".
- **La búsqueda de la inscripción no cambia en la API:** sigue palabra por palabra, con 3 letras como mínimo y 5 resultados como máximo (decisión 051).
- **El "¿Sos…?" sigue buscando el apellido de la cuenta,** porque no lo escribe nadie: lo propone el sistema.

## Por qué

- **Se busca con el nombre con el que se conoce a la persona,** que en un club muchas veces es el de pila.
- **Todos los buscadores se comportan igual,** en la web y en la app, y la regla está en un solo lugar.
- **Escribir más acota,** nunca deja afuera a quien coincide: lo que se agrega solo filtra.

## Qué se resigna

- **Con un nombre de pila común, la lista es más larga** hasta que se escribe una letra del apellido.
- **En los partidos de la ficha de la app,** cada fila muestra solo el apellido del rival: buscar "Juan" deja filas que no dicen "Juan".
- **Los buscadores de la app cambian recién con un APK nuevo.**
