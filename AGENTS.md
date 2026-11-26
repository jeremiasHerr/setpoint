# Proyecto: Setpoint — plataforma de torneos de tenis

Trabajo Final de la Tecnicatura Universitaria en Desarrollo Web (UNCo FaI). Grupo de 3. Entrega: fines de noviembre de 2026.

Plataforma multi-organización (web + app móvil instalable) para circuitos amateur de tenis. La marca se escribe siempre **Setpoint**, con una sola mayúscula ([decisión 108](docs/decisiones/108-la-marca-se-escribe-setpoint.md)).

Cliente de validación real: **POLENTA Team Tenis**, circuito amateur de Neuquén. Sus reglas y datos validan el sistema, pero no son el molde: lo que varía entre circuitos se parametriza.

## Decisiones de arquitectura

- Cuando una tarea implique una decisión de arquitectura o diseño (había otra alternativa razonable y la elección tiene consecuencias), **no la tomes vos**: presentá 2–3 alternativas con sus contras y esperá a que elijamos.
- Una vez elegida, escribila en `docs/decisiones/NNN-titulo-corto.md` (siguiendo la numeración correlativa existente en `docs/decisiones/`) con: contexto, opciones consideradas, decisión, por qué y qué se resigna.
- El ADR va en el mismo commit que el código que lo implementa.
- No documentes detalles de implementación que no sean decisiones.
- Si una decisión reemplaza a otra, no borres la vieja: marcala como "Reemplazada por NNN".

## Documentación

Leer según el alcance de la tarea antes de proponer o editar código:

- **Estado del proyecto y decisiones abiertas:** `docs/README.md`
- **Reglas del dominio (fuente de autoridad):** `docs/02-dominio.md` (incluye §0 con el glosario código ↔ interfaz)
- **Qué se parametriza y qué queda fijo:** `docs/07-configurabilidad.md`
- **Resumen general:** `docs/00-resumen.md`
- **Sistema visual:** `docs/design.md` (Última luz) y pantallas de referencia en `docs/pantallas/`
- **Estructura, ramas y forma de trabajo:** `docs/08-repositorio.md` y `CONTRIBUTING.md`
- **Según el módulo que toques:** `docs/01-vision.md`, `docs/03-flujo-organizacion.md`, `docs/04-flujo-jugador.md`, `docs/05-pagos.md`, `docs/06-ia.md`, `docs/09-setup-inicial.md`, `docs/10-features.md`, `docs/devolucion-25.md`.

## Reglas del proyecto

- **La documentación se actualiza en el mismo commit que el código que la afecta.** Si cambia el motor de desempates, cambia `docs/02-dominio.md`.
- **Cuando se cierra una decisión, se tacha en la tabla de `docs/README.md`**, en ese mismo commit, con el motivo y el enlace al ADR.
- Escribir *por qué* se tomó una decisión, no solo *qué* se decidió. Sirve para la defensa y evita rediscutir.
- **Idioma y glosario:** los documentos, los comentarios, los tests y el código del dominio (archivos, modelos, rutas, esquemas y componentes) siguen la convención actual del repositorio en **español**. La interfaz va en **español rioplatense**, en sentence case. En código, base y API **no se renombran** los términos internos (`Etapa`, `Torneo`, `Cuadro.COMPLEMENTARIA`, `Jugador`), aunque la interfaz muestre nombres genéricos ("Torneo del calendario", "Edición", "Torneo suelto", "Cuadro consuelo", "Jugadores"; ver `docs/02-dominio.md` §0).
- **`main` siempre funciona:** cada push a `main` se publica automáticamente en producción (Railway y Cloudflare Pages). El código entra por PR en ramas cortas (`feat/...`, `fix/...`, `docs/...`, `chore/...`).

## Trabajo de frontend y app móvil

- El sistema visual vigente es **Última luz** (`docs/design.md`, decisión 105). Las pantallas de referencia en `docs/pantallas/` sirven para la estructura de cada flujo, **no** para los colores del sistema anterior.
- **Implementá solo la pantalla que se pide.** No crees otras pantallas, rutas ni componentes "por las dudas", aunque sean del mismo flujo. El equipo trabaja una pantalla por PR y tiene que poder explicar cada archivo.
- **Antes de escribir código, proponé un plan**: qué componentes, dónde va cada archivo y qué se reutiliza. Esperá la aprobación.
- Los HTML de referencia son **visuales**: tienen estilos en línea y datos fijos. No se copian tal cual; se reescriben en React (web, Tailwind v4) o React Native (app, `StyleSheet` sin librería de estilos) usando los tokens y componentes del proyecto (`apps/web/src/components/` y `apps/mobile/src/components/`).
- Colores y tipografías siempre desde los tokens de `docs/design.md`: en web viven en `apps/web/src/index.css` y en la app en `apps/mobile/src/lib/tokens.ts`. Si cambia un token, se sincroniza en los dos lados (decisión 034). Nunca hex sueltos en un componente.
- **Tipografía y color en Última luz:**
  - `Funnel Display 600` para títulos de página/pantalla y rival destacado; `Newsreader 500` solo para el titular del hero de la landing; `Instrument Sans` para interfaz y rótulos; `Geist Mono` con `tabular-nums` **solo para cifras** (no para rótulos, chips ni encabezados de tabla, decisión 123).
  - El rojo es **solo para vencimientos**; los errores de formulario van en `noche` con el componente `Aviso` (decisión 099).
  - Botón principal en `noche-900` con texto blanco (invertido sobre superficies `noche`, decisión 115).
  - En móvil, piso tipográfico de 15px; en Android cada peso se elige con `fontFamily` (`fuentes`), nunca con `fontWeight`.
- Toda la interfaz en español rioplatense, en sentence case.

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

- La app móvil instalable (APK, generada con EAS) es **obligatoria**: el grupo es de 3. No vale una web responsive.
- La integración de IA debe ser **funcionalidad de la aplicación** (importación del padrón/ranking y lectura de resultados desde mensajes), no herramientas de desarrollo.
- Todo se entrega **dockerizado**. `docker compose up` tiene que levantar el proyecto en una máquina limpia, sin depender de cuentas externas (Postgres, Mailpit y pago simulado con `PAGO_SIMULADO=1`).
- Se evalúa lo entregado y funcionando, no lo prometido.

## Arquitectura y convenciones técnicas

- Monorepo con workspaces de npm:
  - `apps/api`: Express 5 + Prisma 6 + PostgreSQL + TypeScript. Módulos organizados **por dominio** en `apps/api/src/modules/` (no por capa técnica).
  - `apps/web`: React 19 + Vite 8 + Tailwind CSS v4 + TanStack Query + React Router 7. `src/features/` espeja los módulos de la API.
  - `apps/mobile`: React Native + Expo SDK 58 + Expo Router + `expo-secure-store`. Comparte una sola copia de React vía `overrides` en el `package.json` raíz (decisión 037).
  - `packages/shared` (`@setpoint/shared`): schemas de Zod v4, tipos inferidos y utilidades compartidas (`busqueda.ts`, `desempate.ts`, `formato.ts`, `superficie.ts`) consumidos por los tres.
  - `functions/`: función de Cloudflare Pages (`functions/inscripcion/[org]/[torneo].ts`) para la vista previa Open Graph del link del torneo en WhatsApp (decisión 144).
- Validar siempre con Zod en el borde: bodies de la API, webhook de MercadoPago y salidas de los modelos de IA.
- Las llamadas a modelos de IA (`apps/api/src/lib/ia.ts` con Anthropic SDK: Haiku para importación, Sonnet para lectura de mensajes) se hacen **solo desde el backend**, nunca desde el cliente, siempre auditadas contra el archivo/texto fuente y bajo los límites de uso y gasto (`IA_PEDIDOS_POR_HORA`, `IA_TOPE_DIARIO_USD`).
- Prisma para acceso a datos (`apps/api/prisma/schema.prisma`, con migraciones en `prisma/migrations/` commiteadas). `organizacionId` (`organizacion_id` en SQL) es la clave de aislamiento multi-organización y debe estar en toda entidad del dominio.
- `Usuario` (credencial/cuenta) y `Jugador` (ficha dentro de un circuito) son entidades separadas.
- Ninguna ruta pública (`/api/publico/...`) devuelve datos de contacto (teléfono ni email).
- Nada de secretos, `.env` ni credenciales (`google-services.json`, claves, tokens) en el repo.
- **No correr `npm audit fix --force`**: rompe la alineación de versiones de Prisma y Expo.

## Comandos frecuentes

- **Desarrollo local:** `npm run dev` (levanta `db` y `mailpit` con Docker Compose, y corre API en `:3000` + web en `:5173`).
- **Entrega dockerizada:** `docker compose up --build` (web `:8080`, API `:3000`, Mailpit `:8025`; para reiniciar la base: `docker compose down -v`).
- **Base de datos:** `npm run db:migrate -w apps/api` y `npm run db:seed -w apps/api`.
- **Tests:** `npm test` (Vitest en `apps/api`: unitarios en paralelo y `*.base.test.ts` de a uno contra el Postgres de Docker; los de base se saltean si Postgres no está corriendo).
- **Verificación antes de cerrar un cambio:**
  - API: `npm run typecheck -w apps/api` y `npm run build -w apps/api`
  - Web: `npm run build -w apps/web` y `npm run lint -w apps/web`
  - Mobile: `npm run typecheck -w apps/mobile` (si reclama rutas tipadas faltantes, correr `npx expo start` una vez desde `apps/mobile`)
- **Evals de IA** (requieren `ANTHROPIC_API_KEY` en `apps/api/.env`): `npm run eval:importacion -w apps/api` y `npm run eval:mensajes -w apps/api`.

## Trampas conocidas

- **MercadoPago: la confirmación viene del webhook, nunca del redirect.** El redirect puede llegar antes de que el pago esté acreditado. Cada organización cobra con su propia cuenta por OAuth con tokens cifrados (decisión 137), no se acepta efectivo/pago diferido (decisión 139) y el pago simulado solo se activa con `PAGO_SIMULADO=1` (decisión 138).
- El webhook debe ser **idempotente**: MercadoPago reenvía notificaciones.
- El cupo se reserva **antes** de ir al checkout, con vencimiento, o se sobrevende. Las inscripciones usan transacciones serializables; por eso los `*.base.test.ts` corren sin paralelismo de archivos (`apps/api/vitest.config.ts`).
- La lógica de `apps/api/src/modules/competencia/` (sorteo, posiciones, cascada de desempates, cuadros) es **lógica pura sin acceso a base de datos**, cubierta por tests unitarios. La cascada de desempates se implementa como **lista ordenada de comparadores**, no como `if` anidados.
- El ranking se calcula por **casillero de etapa con reemplazo** (modelo ATP), no como suma rodante. Ver `docs/02-dominio.md` §7.
- El W.O. y el abandono se computan como **6-0 6-0** al calcular, sin guardar sets en la base (decisiones 016 y 059). El doble W.O. (solo en zonas) computa **0-6 0-6** para ambos (decisión 135).
- **Ojo con `Torneo.edicion`:** en la base nombra la convocatoria completa ("Primavera 2026"), mientras que en la interfaz "edición" es un `Torneo` (una categoría de esa convocatoria). No renombrar el campo.
- **Un solo lugar para buscar jugadores:** los buscadores por nombre/apellido usan `coincideConElNombre` en `packages/shared` (decisión 146).
