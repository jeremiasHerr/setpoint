# 005 — Los clubes se guardan con la configuración del circuito

**Estado:** aceptada — 4 de octubre de 2026

## Contexto

F01 dice que la organización puede, opcionalmente, registrar los clubes donde suele jugar, con sus canchas y superficies ([07-configurabilidad.md](../07-configurabilidad.md) §2.4). El schema ya tiene `Club` y `Cancha`, pero no había API ni formulario: en *Tu circuito* la sección mostraba solo el estado vacío, con el botón deshabilitado.

La pantalla *Tu circuito* se guarda sola: manda la configuración completa en un `PUT /circuito` un momento después de cada cambio. Había que decidir cómo entran los clubes en ese esquema.

## Opciones consideradas

1. **Dentro de la configuración del circuito.** Los clubes y sus canchas viajan en el mismo `PUT`, como las categorías y las etapas.
   - En contra: el `PUT` crece. La API tiene que deducir qué se agregó, qué cambió y qué se borró comparando lo que llega con lo que hay.
2. **Endpoints propios** (`POST`/`PATCH`/`DELETE` por club y por cancha).
   - En contra: más endpoints y más código en la web, y dos formas de guardar conviviendo en la misma pantalla: una sección con autoguardado y otra con botones.
3. **Dejar los clubes fuera de F01.**
   - En contra: la feature queda con un punto sin cumplir, y *Nuevo torneo* sigue sin poder elegir el club de las eliminatorias.

## Decisión

Opción 1. `configuracionCircuitoSchema` suma `clubes`, y `guardarCircuito` los sincroniza en la misma transacción que el resto:

- Cada club y cada cancha puede traer su `id`. **Con id es una fila que ya existe**; sin id, una nueva. Así cambiarle el nombre a un club no lo borra y lo vuelve a crear.
- Si no trae id se busca por nombre. Hace falta porque la web no se entera del id de lo que creó en esa sesión y lo vuelve a mandar sin él.
- **Lo que no llega se borra.** `Club` y `Cancha` no tienen columna `activa` como `Categoria` y `Etapa`.
- Un club o una cancha que ya usa un torneo o un partido **no se puede borrar**: la API responde `409 CLUB_EN_USO` y no guarda nada.

En la pantalla, el interruptor de la sección no se guarda: arranca encendido si hay clubes, y apagarlo solo los oculta.

## Por qué

- **Un solo comportamiento en la pantalla.** Todo *Tu circuito* se guarda solo; los clubes no son la excepción.
- **Menos superficie.** No hay endpoints nuevos ni un segundo hook: se extiende lo que ya está probado.
- **El volumen lo permite.** Un circuito amateur juega en un puñado de clubes; mandar la lista entera en cada guardado no pesa.
- **El id evita el problema real de sincronizar por nombre:** que renombrar "Alta Barda" a "Club Alta Barda" deje huérfanos los partidos jugados ahí.

## Qué se resigna

- **Dar de baja un club con historia.** Si ya tiene torneos o partidos, no se puede quitar de la lista. Para eso haría falta una columna `activa` y una migración; se deja para cuando el caso aparezca.
- **Un error fino por club.** Si el guardado falla por `CLUB_EN_USO`, la pantalla solo dice "no se pudo guardar"; no señala cuál.
- **Edición simultánea.** Dos administradores editando clubes a la vez se pisan: gana el último `PUT`. Es la misma limitación que ya tiene el resto de la pantalla.
- **Un club recién creado y renombrado en la misma sesión** se borra y se crea de nuevo (todavía no tiene id en la web). No pierde nada porque nadie pudo haberlo usado todavía.
