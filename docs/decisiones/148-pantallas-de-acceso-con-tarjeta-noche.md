# 148 — Las pantallas de acceso: franja noche y el formulario en una tarjeta noche

**Estado:** aceptada — 24 de noviembre de 2026.

## Contexto

Al ir de la landing a *Ingresar*, el grupo encontró tres cosas: la franja de arriba pasaba de noche a blanca, el logo cambiaba de colores (blanco y pelota sobre noche, noche y lona sobre blanco) y el formulario quedaba pegado arriba, en lugar de al medio de la pantalla. *Registrar la organización* y *Recuperar la contraseña* comparten el mismo marco y tenían lo mismo.

Son la puerta entre la landing, que es noche, y el panel del organizador, que tiene la franja noche y el fondo blanco.

## Opciones consideradas

1. **Todo noche, como la landing,** con el formulario en una tarjeta blanca al medio.
   - En contra: una tarjeta blanca grande sobre fondo oscuro, y la columna de pasos del registro pasa a texto claro.
2. **La pintura del club en una mitad y el formulario en la otra.**
   - En contra: carga una imagen pesada para ingresar, repite el hero y contradice que el hero es el único lugar con atmósfera (design.md).
3. **Franja noche y fondo claro, con el formulario en una tarjeta blanca.**
   - En contra: sigue el salto de la landing oscura a una página clara, y es el ingreso de cualquier SaaS.
4. **Franja noche y fondo claro, con el formulario en una tarjeta noche.**
   - En contra: los campos, el botón y los avisos necesitan una versión para noche, que no tenían.

## Decisión

Opción 4, elegida por el grupo.

- **La franja es la del organizador:** noche, de 60, con el logo blanco y la pelota, que lleva a la landing. A la derecha, la pregunta y el enlace a la otra pantalla; en el celular queda solo el enlace.
- **El formulario va en una tarjeta noche, al medio de la pantalla** a lo alto y a lo ancho, sobre el fondo `niebla`.
- **Los campos sobre noche** tienen relleno `noche-900`, borde `borde-campo` y texto blanco, con el rótulo en `pizarra-400`. El activo y el inválido llevan borde de 2 px blanco, y el autocompletado del navegador no los pinta de celeste.
- **El botón principal va dado vuelta,** en papel con texto noche, como en la landing.
- **El aviso de error va en `noche-2`,** más claro que los campos, para que no se confunda con uno enfocado.
- **En *Registrar la organización*, "Lo que sigue" pasa a papel:** la tarjeta noche de la pantalla es la del formulario.
- Cada componente lleva la variante con una propiedad, `sobreNoche`, como el logo.

## Por qué

- **El logo y la franja no cambian** entre la landing, el ingreso y el panel.
- **La tarjeta noche es el recurso de jerarquía más fuerte del sistema,** y en estas pantallas hay una sola cosa que hacer.
- **El fondo claro anticipa el panel,** que también es claro debajo de la franja.

## Qué se resigna

- **Los campos, el código, el aviso y el botón tienen una variante más,** que hay que mantener junto con la clara.
- **La tarjeta noche ya no muestra solo un dato:** acá contiene un formulario.
- **Que el autocompletado no pinte los campos depende de un recurso del navegador:** una sombra interna del color del campo.
