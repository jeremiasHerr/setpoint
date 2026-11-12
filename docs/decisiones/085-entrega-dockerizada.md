# 085 — La entrega dockerizada

**Estado:** aceptada — 12 de noviembre de 2026

## Contexto

La cátedra pide que `docker compose up` levante el proyecto en una máquina limpia, sin cuentas externas. Hasta ahora el `docker-compose.yml` levantaba solo Postgres y Mailpit: la API y la web corrían con `npm run dev`.

Para sumar la API y la web había tres cosas que resolver:

- **`packages/shared` se consume como TypeScript.** Su `package.json` apunta a `src/index.ts`, y la API lo importa. Vite y Metro lo compilan solos, pero `tsc` + `node dist/index.js` falla al llegar a ese `.ts`.
- **Quién sirve la web compilada.** En desarrollo la web llega a la API por el proxy de Vite (`/api` → `localhost:3000`), que con el build ya no existe.
- **La base arranca vacía.** Sin el seed no hay cuentas para entrar a la demo, pero el seed empieza vaciando la base.

## Opciones consideradas

**Cómo corre la API**

1. **Con `tsx`, sin compilar**, igual que en desarrollo.
   - En contra: la imagen lleva las dependencias de desarrollo y arranca un poco más lento.
2. **Compilar `shared` a JavaScript.**
   - En contra: cambia el `package.json` de `shared`, que consumen también la web y la app, y hay que volver a probar Vite y Metro a días de la entrega.
3. **Empaquetar la API con esbuild o tsup**, con `shared` adentro.
   - En contra: otra herramienta de build, y Prisma igual necesita sus binarios aparte.

**Quién sirve la web**

1. **nginx**, que sirve el build y le pasa `/api` a la API.
   - En contra: un contenedor y un archivo de configuración más.
2. **La API, con `express.static`.**
   - En contra: mezcla la web dentro de la API, y la versión publicada sirve la web desde otro lado.

**El seed**

1. **Automático, solo si la base no tiene ninguna organización.**
   - En contra: un paso más al arrancar el contenedor.
2. **Un comando aparte** (`docker compose run api npm run db:seed`).
   - En contra: un paso más para quien levanta el proyecto, y si se lo saltea, no puede entrar.

## Decisión

- **La API corre con `tsx`.** El contenedor arranca con `npm run start:contenedor`: `prisma migrate deploy`, el seed si corresponde, y la API.
- **nginx sirve la web** en `http://localhost:8080` y le pasa `/api` a la API, como el proxy de Vite.
- **El seed corre si la base está vacía y `SEMBRAR=si-vacia`.** La variable la pone el `docker-compose.yml`; sin ella no se siembra nunca, que es lo que necesita la versión publicada ([decisión 086](086-version-publicada.md)).

El compose anda sin `.env`: sin token de MercadoPago el pago es simulado ([decisión 053](053-pago-sin-credenciales.md)), los mails van a Mailpit, y sin `ANTHROPIC_API_KEY` la importación del padrón termina en error con el motivo.

## Por qué

- **Es lo que menos toca el código a días de la entrega.** `tsx` es lo mismo que corre en desarrollo, y nginx no cambia nada de la web.
- **La web y la API en la misma dirección**, como en desarrollo: sin CORS, y con las mismas rutas relativas.
- **Quien levanta el proyecto entra sin hacer nada más**, y un `docker compose restart` no le borra lo que cargó en la demo.

## Qué se resigna

- **Una imagen de la API más pesada**, con TypeScript, tsx y el CLI de Prisma adentro.
- **El seed no se vuelve a cargar solo.** Para empezar de cero hay que borrar el volumen: `docker compose down -v`.
