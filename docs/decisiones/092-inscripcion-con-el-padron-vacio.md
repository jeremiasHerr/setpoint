# 092 — Con el padrón vacío, el torneo se abre a cualquiera

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

*Nuevo torneo* arranca con "Quién se puede inscribir: Solo el padrón", que es lo que usa POLENTA. Una organización recién registrada no tiene padrón, así que con esa opción publicaría un torneo al que no se puede anotar nadie, sin enterarse hasta que alguien le avise.

## Opciones consideradas

1. **Que el formulario lo resuelva.** Con el padrón vacío, el torneo nuevo arranca en "Cualquiera", y "Solo el padrón" se ve deshabilitada, con los links para importar la planilla o cargar jugadores.
   - En contra: no empuja a importar antes de crear el torneo.
2. **Una pantalla previa** a *Nuevo torneo* que, con el padrón vacío, pregunte "¿Tenés tus jugadores en una planilla?".
   - En contra: un paso más en el camino que el inicio presenta como el más rápido ([decisión 088](088-dos-caminos-iguales-en-el-inicio.md)), una ruta nueva, y repite la tarjeta "¿Ya tenés tus jugadores en un Excel?" del inicio.

## Decisión

Opción 1, elegida por el grupo.

- **Padrón vacío** quiere decir sin jugadores del padrón activos: los perfiles pendientes de una inscripción en curso no cuentan.
- **El torneo nuevo arranca en "Cualquiera".** Quien se inscribe entra al padrón al pagar ([07](../07-configurabilidad.md) §2.6).
- **"Solo el padrón" se ve deshabilitada**, con "Tu padrón está vacío. Para usar Solo el padrón, importá tu planilla o cargá tus jugadores", con los dos links.
- **Un borrador que ya estaba en "Solo el padrón"** lo sigue mostrando, con el aviso en rojo: "Con el padrón vacío no se puede anotar nadie".

## Por qué

- **Nadie publica un torneo vacío sin darse cuenta.**
- **No agrega pasos:** el torneo se sigue creando en dos minutos, y el aviso dice dónde cargar el padrón para quien lo quiera.

## Qué se resigna

- **Quien después importa su padrón tiene que cambiar el modo a mano** si quiere "Solo el padrón". El borrador no cambia solo.
