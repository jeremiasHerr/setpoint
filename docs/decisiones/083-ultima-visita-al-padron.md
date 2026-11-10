# 083 — La última visita al padrón se guarda en la base, por administrador

**Estado:** aceptada — 9 de noviembre de 2026

## Contexto

La organización ve cada vinculación nueva sin tener que aprobarla ([decisión 051](051-vinculacion-con-el-padron.md)). La referencia del padrón las junta en el filtro "Nuevas": *"Las vinculaciones desde tu última visita, el jueves 18"*. Para eso el sistema tiene que saber cuándo fue la última visita, y hasta ahora no guardaba nada parecido.

## Opciones consideradas

1. **En la base, por administrador:** un campo en `AdminOrganizacion` que se actualiza al abrir el padrón.
   - En contra: una migración y un endpoint más.
2. **En el navegador**, en `localStorage`, sin tocar la API.
   - En contra: en otra compu o en otro navegador todas vuelven a aparecer como nuevas, y se pierde si se borran los datos del navegador.
3. **Una ventana fija:** "Nuevas" son las de los últimos 7 días, sin guardar nada.
   - En contra: no es "desde tu última visita". Una que ya se vio sigue apareciendo toda la semana, y quien no entra en 8 días se pierde alguna.

## Decisión

Opción 1, elegida por el grupo.

- **`AdminOrganizacion.padronVistoEn`**, nulo hasta la primera visita.
- **`POST /api/organizaciones/:slug/jugadores/visita`** guarda la visita de ahora y devuelve la anterior: `{ anterior }`, `null` la primera vez.
- **La web lo pide una vez al abrir el padrón** y conserva la respuesta mientras la pantalla está abierta. "Nuevas" son los perfiles con cuenta vinculados después de `anterior`; la primera vez, todos los vinculados. Si la visita no se pudo guardar, el padrón anda igual, sin el filtro.
- **El padrón devuelve `vinculadoEn` y `vinculadoPor`** de cada perfil con cuenta, que ya se guardaban al confirmarse el pago, y sus inscripciones vigentes para el panel.

## Por qué

- **Es lo que dice la referencia**, y funciona igual en cualquier compu.
- **Cada administrador tiene la suya.** Si dos administran el mismo circuito, lo que mira uno no le borra las nuevas al otro.
- **Devolver la anterior al guardar la nueva** resuelve las dos cosas en un pedido, sin una ventana entre leer y escribir.

## Qué se resigna

- **Abrir el padrón ya cuenta como mirarlo.** Quien entra y se va sin elegir "Nuevas" las pierde de ese filtro; las que necesitan algo siguen en "Para revisar", que no depende de la visita.
- **Volver al padrón unos minutos después cuenta como otra visita**: la web conserva la respuesta mientras la tiene en memoria (5 minutos después de salir de la pantalla).
- **Las vinculaciones hechas antes de guardar `vinculadoEn`** no tienen fecha y no aparecen nunca como nuevas.
