# Proyecto: plataforma de torneos de tenis

Trabajo Final de la Tecnicatura Universitaria en Desarrollo Web (UNCo FaI). Grupo de 3. Entrega: fines de noviembre de 2026.

Cliente de validación real: **POLENTA Team Tenis**, circuito amateur de Neuquén.

## Decisiones de arquitectura

- Cuando una tarea implique una decisión de arquitectura o diseño (había otra alternativa razonable y la elección tiene consecuencias), **no la tomes vos**:presentá 2-3 alternativas con sus contras y esperá a que elijamos.
- Una vez elegida, escribila en `docs/decisiones/NNN-titulo-corto.md` con:
  contexto, opciones consideradas, decisión, por qué, y qué se resigna.
- El ADR va en el mismo commit que el código que lo implementa.
- No documentes detalles de implementación que no sean decisiones.
- Si una decisión reemplaza a otra, no borres la vieja: marcala como
  "Reemplazada por NNN".

## Documentación

El estado del proyecto y las decisiones abiertas están en @docs/README.md

Las reglas del dominio son la fuente de autoridad: @docs/02-dominio.md

Qué se parametriza y qué queda fijo: @docs/07-configurabilidad.md

El resto de los documentos (`01-vision`, `03-flujo-organizacion`, `04-flujo-jugador`, `05-pagos`, `06-ia`) están en `docs/` y se leen cuando el trabajo los toca.

## Reglas del proyecto

- **La documentación se actualiza en el mismo commit que el código que la afecta.** Si cambia el motor de desempates, cambia `02-dominio.md`.
- **Cuando se cierra una decisión, se tacha en la tabla del README**, en ese mismo commit, con el motivo.
- Escribir *por qué* se tomó una decisión, no solo *qué* se decidió. Sirve para la defensa y evita rediscutir.
- Los documentos van en español. El código, en inglés.

## Trabajo de frontend

- Las pantallas de referencia están en `docs/pantallas/`, una por archivo. El sistema visual, en `docs/design.md`.
- **Implementá solo la pantalla que se pide.** No crees otras pantallas, rutas ni componentes "por las dudas", aunque sean del mismo flujo. El equipo trabaja una pantalla por PR y tiene que poder explicar cada archivo.
- **Antes de escribir código, proponé un plan**: qué componentes, dónde va cada archivo, qué se reutiliza. Esperá la aprobación.
- Los HTML de referencia son **visuales**: tienen estilos en línea y datos fijos. No se copian tal cual; se reescriben en React con los tokens y los componentes del proyecto.
- Colores y tipografías siempre desde los tokens de `design.md`. Nunca hex sueltos en un componente.
- Los números van en Geist Mono con `tabular-nums`. Toda la interfaz en español rioplatense, en sentence case.

### Diseño frontend

<diseño_frontend>
Tendés a converger en elecciones genéricas "de promedio", y eso produce el
estilo que la gente reconoce como hecho por IA. Quiero lo contrario: un diseño
con punto de vista propio, pensado para ESTE proyecto y no para cualquiera.

Antes de escribir código:
1. Identificá el tema: qué es, para quién y cuál es la tarea principal del
   usuario. Sacá las ideas visuales del mundo de ese tema (materiales, objetos,
   jerga, cultura), no de tendencias de diseño.
2. Armá un plan corto: 4–6 colores con nombre y hex, 1–2 tipografías con su
   rol, el layout en una frase más un wireframe ASCII, y 2–3 principios.
3. Revisá el plan: si alguna parte es lo que harías para cualquier página
   parecida, cambiala y decime por qué.

Evitá estos defaults salvo que yo los pida:
- Inter, Roboto, Arial, system-ui o Space Grotesk como cara principal.
- Gradiente violeta/índigo; crema + serif + terracota; negro + un acento neón.
- Todo en tarjetas redondeadas iguales con la misma sombra gris.
- Etiquetas en MAYÚSCULAS espaciadas sobre cada título, "A · B · C", "→" en
  cada botón, 01/02/03 si el contenido no es una secuencia, una sola palabra
  del título resaltada.
- Fade + slide-up en cada sección y efecto hover en cada tarjeta.

Sí quiero:
- La tipografía como protagonista: escala clara, contraste fuerte de pesos y
  tamaños, líneas de menos de 80 caracteres.
- Una paleta comprometida: un color dominante con acentos marcados, en
  variables CSS.
- Fondos con atmósfera (capas, texturas, patrones ligados al tema) cuando sumen.
- Un solo momento de animación orquestado (por ejemplo, la carga de la página
  con entradas escalonadas). El resto de la animación, solo como respuesta a
  acciones del usuario.
- Textos reales y específicos, en voz activa: los botones dicen lo que hacen.
- Arriesgar en UN elemento memorable y que todo lo demás sea sobrio. Antes de
  terminar, sacá un adorno.

Piso de calidad, sin anunciarlo: responsive, foco visible con teclado,
prefers-reduced-motion y contraste accesible.

Al terminar, si podés, sacá una captura, criticala como un director de arte
exigente y corregí.
</diseño_frontend>

## Restricciones de la cátedra

- La app móvil instalable (APK) es **obligatoria**: el grupo es de 3. No vale una web responsive.
- La integración de IA debe ser **funcionalidad de la aplicación**, no herramientas de desarrollo.
- Todo se entrega **dockerizado**. `docker compose up` tiene que levantar el proyecto en una máquina limpia, sin depender de cuentas externas.
- Se evalúa lo entregado y funcionando, no lo prometido.

## Convenciones técnicas

- Monorepo con workspaces: `apps/api`, `apps/web`, `apps/mobile`, `packages/shared`.
- Los tipos y schemas de Zod compartidos viven en `packages/shared` y los consumen los tres.
- Validar siempre con Zod en el borde: bodies de la API, webhook de MercadoPago, y salidas de los modelos de IA.
- Las llamadas a modelos de IA se hacen **solo desde el backend**. Nunca desde el cliente.
- Prisma para acceso a datos. `organizacion_id` es la clave de aislamiento: debe estar en toda entidad del dominio.
- Nada de secretos ni credenciales en el repo.

## Trampas conocidas

- **MercadoPago: la confirmación viene del webhook, nunca del redirect.** El redirect puede llegar antes de que el pago esté acreditado.
- El webhook debe ser **idempotente**: MercadoPago reenvía notificaciones.
- El cupo se reserva **antes** de ir al checkout, con vencimiento, o se sobrevende.
- La cascada de desempates se implementa como **lista ordenada de comparadores**, no como if anidados. Es el único lugar del proyecto donde los tests unitarios se pagan solos.
- El ranking se calcula por **casillero de etapa con reemplazo**, no como suma rodante. Ver `02-dominio.md` §7.
- El W.O. se registra como 6-0 6-0.
