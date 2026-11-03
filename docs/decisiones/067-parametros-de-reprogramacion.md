# 067 — Los parámetros de reprogramación van en el torneo, sin campo en la convocatoria

**Estado:** aceptada — 3 de noviembre de 2026

## Contexto

[07-configurabilidad.md](../07-configurabilidad.md) §2.3 dice que las reprogramaciones permitidas por partido y la antelación mínima para reprogramar son parámetros del torneo. En POLENTA: una, con 24 horas. El schema no los tenía, y F14 los necesita para decidir si un jugador puede reprogramar ([decisión 065](065-cambiar-una-fecha-sin-confirmar.md)).

## Opciones consideradas

1. **Dos columnas en `Torneo`**, `reprogramacionesPermitidas` (por defecto 1) y `horasAntelacionReprogramar` (por defecto 24), sin campo en *Nuevo torneo* por ahora.
   - En contra: la organización no los puede cambiar desde la interfaz.
2. **Las mismas columnas, y los campos en *Nuevo torneo*.**
   - En contra: es otra pantalla en el mismo trabajo, sin una referencia que los dibuje.
3. **Constantes en el código.**
   - En contra: contradice 07, y pasarlas después al torneo obliga a una migración y a tocar cada uso.

## Decisión

Opción 1. Los valores por defecto son los de POLENTA.

## Por qué

- **La regla ya queda parametrizada** donde dice 07, sin migraciones futuras.
- **Sumar los campos a la convocatoria es solo interfaz**: no cambia la API ni la lógica.

## Qué se resigna

- **Otros circuitos no pueden cambiarlos** hasta que se sumen a *Nuevo torneo*.
