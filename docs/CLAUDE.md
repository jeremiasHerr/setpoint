# Proyecto: plataforma de torneos de tenis

Trabajo Final de la Tecnicatura Universitaria en Desarrollo Web (UNCo FaI). Grupo de 3. Entrega: fines de noviembre de 2026.

Cliente de validación real: **POLENTA Team Tenis**, circuito amateur de Neuquén.

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
