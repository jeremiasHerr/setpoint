# 105 — Sistema visual: Última luz

**Estado:** aceptada — 18 de noviembre de 2026. Reemplaza la [decisión 090](090-mas-contraste.md), y el dibujo del logo de la [104](104-logo-marcas.md). Reemplazada en el botón principal por la [decisión 114](114-boton-principal-blanco.md): pasa a texto blanco sobre `lona-texto`.

## Contexto

Hasta acá la web y la app usaban el sistema *Verde pelota*: negro, grises y un solo acento lima. Al revisar el frontend, el grupo pidió una landing con "un dibujo que parezca hecho por un humano, enmarcado", y que el producto se sintiera empresarial. Negro con un acento neón, además, es uno de los lugares comunes que el proyecto se propuso evitar (CLAUDE.md, diseño frontend). Y el lima no llega al contraste como texto sobre blanco: quedaba encerrado en las tarjetas negras, y las pantallas claras casi no tenían color (design.md §13 lo tenía como decisión abierta).

Se dibujaron cinco direcciones completas, con su landing, su tablero, su Cuándo juego y su design.md (artifact *Cinco direcciones de SetPoint*). Después se iteró la elegida en *Última luz v2* y se resolvieron el título, los botones y el demo de la landing (*Tres decisiones de la landing*).

## Opciones consideradas

**La dirección:**

1. **Última luz.** El club al atardecer, pintado y enmarcado en el hero, con el producto apoyado encima. Debajo, el producto es claro, sobrio y denso.
   - En contra: todo el carácter depende de que la pintura salga bien.
2. **Regla.** Blanco, tinta y una grilla a la vista; el hero es un dato real en grande.
   - En contra: es la más parecida a Vercel, y achicando el número queda una plantilla.
3. **Calma.** Fondo piedra, verde bosque y tarjetas con sombra.
   - En contra: las sombras y los radios grandes le quitan densidad al tablero, y podría ser de cualquier fintech.
4. **Pleno.** El lima pasa de acento a campo: el hero entero en lima.
   - En contra: un campo de lima así de grande puede resultar estridente.
5. **Trazo.** Dibujo a línea, celeste y amarillo.
   - En contra: lo simpático le resta seriedad frente a un circuito grande, y es la que más días lleva.

**Cómo se pasa el código al sistema nuevo:**

1. **Renombrar todos los tokens** con los nombres nuevos, en la web y en la app, con un script.
   - En contra: el cambio toca casi todos los archivos.
2. **Dejar los nombres viejos con los valores nuevos.**
   - En contra: los nombres mienten ("negro" valdría azul noche), y el código y design.md usarían palabras distintas.
3. **Nombres nuevos con los viejos como alias**, y migrar pantalla por pantalla.
   - En contra: dos vocabularios conviven, probablemente hasta después de la entrega.

## Decisión

Dirección 1, Última luz, en su segunda vuelta, con los tokens renombrados en un solo cambio (opción 1), y la app junto con la web. El detalle está en [design.md](../design.md):

- **Noche** (`#101A2C`) en lugar del negro, **pizarra** para los grises, y fondo **niebla** con tarjetas en **papel**.
- **El lima se parte en dos.** La **lona** (`#62BB78`), un verde medio, es la acción del jugador, lo ganado y lo que clasifica, con sus versiones de fondo y de texto. La **pelota** (el lima de antes) queda solo para el logo y para una pelota dibujada.
- **Cada estado tiene su color.** Con fecha es azul; sin coordinar, punteado; vencido, rojo. El cuadro principal va en ámbar y el consuelo en petróleo.
- **Funnel Display** para los títulos del producto y de la landing. **Newsreader** solo en el titular del hero. Instrument Sans y Geist Mono siguen.
- **El logo son las marcas de una zona:** tres partidos jugados y el último, levantado, que es el set point. La idea es la de la [decisión 104](104-logo-marcas.md), que se tomó en paralelo; cambia el dibujo. Las marcas van sueltas también sobre claro, en noche y con la levantada en lona, sin el recuadro negro que el lima necesitaba sobre blanco, y la palabra va en Funnel Display, como los títulos.

## Por qué

- **La atmósfera está en un solo lugar.** La pintura enmarcada responde a la devolución, y el producto sigue claro y denso, que es lo que ya funcionaba.
- **La lona se puede usar en lo claro.** Su versión de texto da 7,38:1 sobre blanco; el lima no llegaba. En el hero, además, el lima era lo más brillante y peleaba con el cielo de la pintura.
- **"Con fecha" se distingue de un vistazo.** Antes era un gris entre el negro de jugado y la línea de pendiente.
- **Funnel Display en el producto.** Con Newsreader, el título del tablero parecía el de un documento. La serif queda para la única frase que vende una emoción.
- **Los nombres de los tokens dicen lo que valen.** En la defensa, design.md y el código usan las mismas palabras. El renombre es mecánico, y se verifica compilando y mirando las pantallas.
- **La app cambia junto con la web.** Es el mismo sistema en dos densidades (design.md §1): una sola de las dos con otra paleta parecería otro producto.

## Qué se resigna

- **Un cambio grande a dos semanas de la entrega.** Toca casi todos los archivos de la web y de la app, y hay que generar otro APK.
- **El lima deja de ser el rasgo de marca del producto.** Queda en el logo.
- **Dos fuentes más en la web, y una en la app.**
- **Los íconos del APK, el favicon de la 104 y `docs/logos/` quedan con el dibujo de la 104** hasta regenerarlos con el de esta decisión. El favicon de la web ya usa el nuevo.
- **Las referencias de `docs/pantallas/` y el canvas *Verde pelota* quedan con el sistema anterior.** No se reescriben: mandan los tokens y design.md.
