# 154 — La fila del padrón muestra el email del vinculado y «sin vincular»

**Estado:** aceptada — 25 de noviembre de 2026.

## Contexto

design.md §8 (Vinculación) dice que en el padrón un jugador vinculado lleva el email de su cuenta debajo del nombre, y uno sin vincular lleva el rótulo «sin vincular». La fila implementada mostraba otra cosa: un chip «con cuenta» y, debajo del nombre, «desde nov 26». No coincidían, y el grupo tenía que elegir cuál valía.

## Opciones consideradas

1. **Lo de design.md:** el email del vinculado y «sin vincular» en el resto.
   - En contra: un email largo se corta en el celular.
2. **Lo implementado:** chip «con cuenta» y «desde …».
   - En contra: marca lo que está bien y no lo que falta, y no dice con qué email está vinculado.
3. **Solo «sin vincular»,** sin nada en los vinculados.
   - En contra: para ver el email hay que abrir al jugador, un paso más al revisar un homónimo.

## Decisión

Opción 1, elegida por el grupo.

- **Vinculado:** el email de su cuenta debajo del nombre, en `pizarra-500`, cortado con elipsis si no entra.
- **Sin vincular:** el rótulo «sin vincular» en el mismo lugar. Marca a quién le falta el link personal ([decisión 050](050-link-personal-de-inscripcion.md)).
- **Sale el chip «con cuenta»** y sale el «desde …».
- **La vinculación nueva sigue marcada**, con el chip `nueva` de design.md, para lo vinculado desde la última visita ([decisión 083](083-ultima-visita-al-padron.md)). El filtro *Nuevas* no cambia.
- **No cambia la API:** el padrón ya trae la cuenta, y es una ruta solo para quien administra.

## Por qué

- **Marca lo que falta,** que es lo que la organización tiene que resolver: mandar el link personal.
- **El email es lo que se necesita para revisar un homónimo** ([decisión 051](051-vinculacion-con-el-padron.md)), sin abrir la ficha.
- **Un solo criterio** entre el documento y la pantalla.

## Qué se resigna

- **El «desde» de la vinculación en la fila:** sigue en el panel del jugador y en *Nuevas*.
- **En el celular, un email largo se corta:** completo se ve en el panel.
