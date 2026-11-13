# 093 — Un esqueleto común mientras carga, que aparece si tarda

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

Cada pantalla de la web y de la app mostraba su propio texto mientras esperaba a la API ("Cargando…", "Cargando tu circuito…"). Al recargar, React Query arranca sin nada guardado y el texto se veía por un instante aunque la API contestara en milisegundos: un parpadeo en todas las pantallas. El Inicio ya lo evitaba mostrando solo el encabezado, pero sin nada que dijera que algo venía.

## Opciones consideradas

1. **Un esqueleto común, con pocas formas, que aparece recién a los 200 ms.**
   - En contra: no copia exactamente cada pantalla, y al llegar los datos algo se reacomoda.
2. **Un esqueleto por pantalla**, con la forma de cada una.
   - En contra: unos veinte esqueletos para mantener, y cada cambio de una pantalla toca dos lugares.
3. **Solo la espera:** nada durante 200 ms y, si tarda más, el texto de siempre.
   - En contra: si la API tarda (un celular lento, la primera consulta del día), se sigue viendo el texto.

## Decisión

Opción 1, en la web y en la app.

- **Un componente `Esqueleto` en cada una**, con barras grises (`--linea`) que laten suave. Con "reducir movimiento" activado quedan quietas.
- **Formas en la web:** `pagina` (las pantallas del organizador), `lista` (las públicas y del jugador) y `bloque` (lo que carga adentro de una pantalla que ya se ve). **En la app:** `tarjeta` y `lista`.
- **Aparece a los 200 ms.** Mientras tanto ocupa su lugar, invisible, para no empujar nada al aparecer.
- **Para el lector de pantalla** dice "Cargando".
- Los mensajes de error no cambian.

## Por qué

- **La espera saca el parpadeo**, que era el problema: si la API contesta antes de 200 ms, no se ve nada.
- **El esqueleto dice que la pantalla está cargando** cuando de verdad tarda, sin un texto que salte, y con una forma parecida a lo que va a aparecer.
- **Un solo componente** se mantiene en un lugar y se ve igual en todas las pantallas; tres formas alcanzan para que se parezca a lo que viene.

## Qué se resigna

- **Al llegar los datos, la pantalla se reacomoda un poco**, porque el esqueleto no tiene su forma exacta.
- **Si la API tarda entre 200 ms y medio segundo, el esqueleto se ve un instante.** Es el costo de no esperar más antes de decir que algo está cargando.
- **En la app, el cambio llega con el próximo APK.**
