# 091 — La organización tiene una lista de contactos, cada uno con su tipo

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

En *Tu circuito*, el contacto era un solo campo de texto libre (`Organizacion.contacto`) que se muestra a los jugadores en el link del torneo, por ejemplo cuando no están en el padrón y tienen que pedir que los agreguen.

Al probarlo, el campo era muy grande y no quedaba claro cómo poner más de un contacto. Los circuitos suelen tener varios: el WhatsApp de uno o dos organizadores y la cuenta de Instagram. Además, un número de WhatsApp escrito como texto no se puede abrir como chat.

## Opciones consideradas

1. **Una tabla `ContactoOrganizacion`**, con tipo (WhatsApp o red social), valor y orden.
   - En contra: una tabla y una migración más.
2. **Una columna JSON** en `Organizacion` con la lista.
   - En contra: la valida solo Zod y la base no la ve, y se aparta de cómo está modelado el resto. Con `organizacion_id` en cada fila, el contacto sigue la regla de aislamiento como cualquier entidad del dominio.

## Decisión

Opción 1, elegida por el grupo.

- **Dos tipos:** *WhatsApp*, un número, y *Red social*, un usuario o un link. Hasta 10 por organización.
- **Se cargan de a uno:** "+ Agregar contacto" abre el tipo y un campo corto; al agregarlo queda en la lista, con un botón para quitarlo. Se guardan con el resto de *Tu circuito*.
- **En el link del torneo, el WhatsApp abre el chat** (`wa.me`) con "Hola, te escribo por el torneo…" ya escrito. Un link de red social se abre; un usuario se muestra tal cual.
- **La migración pasa el texto de antes a un contacto:** WhatsApp si es solo un número, red social si no. La columna `contacto` se borra.

## Por qué

- **Es lo que tienen los circuitos:** varios contactos de distinto tipo, no un texto.
- **El tipo permite abrir el chat**, que es lo que el jugador hace con un número de WhatsApp.
- **Una tabla es lo que el resto del schema ya hace** con las listas de la organización (categorías, etapas, clubes).

## Qué se resigna

- **No hay más tipos que esos dos.** Un email o un teléfono para llamar van como "red social", sin link. Sumar un tipo es agregar un valor al enum.
- **Un texto de contacto que mezclaba cosas** ("Juan 299… o Instagram") queda migrado como una sola red social. La organización tiene que separarlo a mano.
