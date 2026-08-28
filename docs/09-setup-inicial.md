# Inicialización del proyecto

> Guía para la primera sesión de trabajo. **Háganla los tres juntos**, en una máquina, rotando el teclado. Es el caso más claro de "juntos la primera vez de cada patrón" ([08-repositorio.md](08-repositorio.md) §4).
>
> Duración estimada: una sesión larga o dos cortas.

---

## Principio rector

**Rebanada vertical primero, expansión después.**

El objetivo de esta guía no es tener las tres apps armadas. Es que **un dato guardado en Postgres se vea en el celular**. Cuando eso pasa, el resto es repetir el patrón.

Armar los tres proyectos por separado y dejar la integración para más adelante es la forma más común de llegar a octubre con tres carpetas vacías y ningún flujo probado.

---

## Fase 0 — Repositorio y documentación

**Objetivo:** que los tres tengan el repo clonado con la documentación adentro.

1. Crear el repo `setpoint` en GitHub, **privado**, sin README (lo agregamos nosotros)
2. Agregar a los otros dos como colaboradores con permiso de escritura
3. Localmente:

```bash
git clone https://github.com/<usuario>/setpoint.git
cd setpoint
mkdir docs
# copiar los 9 documentos a docs/
# copiar README.md y CLAUDE.md a la raíz
git add .
git commit -m "docs: documentación de diseño inicial"
git push
```

4. Agregar la descripción y los topics en GitHub

**Verificación:** los otros dos clonan y ven la documentación.

---

## Fase 1 — Esqueleto del monorepo

**Objetivo:** estructura de carpetas y workspaces funcionando.

```bash
npm init -y
```

Editar el `package.json` de la raíz:

```json
{
  "name": "setpoint",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/api & npm run dev --workspace=apps/web",
    "test": "npm run test --workspace=apps/api"
  }
}
```

Crear el `.gitignore`:

```
node_modules/
dist/
build/
.env
.expo/
*.log
```

Y el `.env.example`:

```
DATABASE_URL="postgresql://setpoint:setpoint@localhost:5432/setpoint"
JWT_SECRET="cambiar-en-produccion"
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

**Commit.** No sigan hasta acá sin commitear.

---

## Fase 2 — Postgres en Docker

**Objetivo:** primera pieza de Docker, la más simple que existe.

Crear `docker-compose.yml` en la raíz:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: setpoint
      POSTGRES_PASSWORD: setpoint
      POSTGRES_DB: setpoint
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d db
docker compose ps        # debería decir "running"
```

**Verificación:** el contenedor levanta y queda corriendo. Si falla, casi siempre es que el puerto 5432 ya está ocupado por un Postgres instalado localmente.

> No hay Dockerfile todavía. Esto es una imagen oficial y ya está. Es la entrada más suave a Docker que existe, y deja el concepto de `compose` aprendido antes de escribir imágenes propias.

---

## Fase 3 — API con Prisma

**Objetivo:** el schema en la base y un endpoint que devuelva datos reales.

```bash
mkdir -p apps/api && cd apps/api
npm init -y
npm i express cors dotenv zod
npm i -D typescript tsx @types/express @types/node @types/cors prisma
npx tsc --init
npx prisma init
```

### 3.1 El schema

Escribir `prisma/schema.prisma` a partir de [02-dominio.md](02-dominio.md) y [07-configurabilidad.md](07-configurabilidad.md).

> **Escríbanlo completo**, aunque no vayan a usar todas las tablas todavía. Ya está diseñado, y en desarrollo sin datos reales `npx prisma migrate reset` borra todo y vuelve a empezar sin costo. El dolor de las migraciones aparece recién cuando hay datos que no se pueden perder.

```bash
npx prisma migrate dev --name init
npx prisma studio        # inspección visual de las tablas
```

**Verificación:** Prisma Studio muestra todas las tablas vacías.

### 3.2 Seed

Escribir `prisma/seed.ts` con datos realistas:

- 1 organización (POLENTA)
- 2 categorías (Segunda, Tercera)
- 5 etapas del calendario
- 26 jugadores de Tercera con sus puntos reales del ranking de referencia
- 1 torneo en estado `publicado`

```bash
npx prisma db seed
```

**Verificación:** Prisma Studio muestra los jugadores cargados.

> El seed es la inversión que más rinde de toda esta guía. Sin datos, cada pantalla que construyan después va a estar vacía y no van a poder probar nada. Con 26 jugadores y sus puntos reales, todo lo que hagan de acá en adelante se ve funcionando.

### 3.3 Primer endpoint

`src/index.ts` con Express, y un solo endpoint real:

```
GET /api/organizaciones/:id/ranking?categoria=tercera
```

Devuelve el ranking ordenado. Es la consulta más simple que produce algo demostrable.

```bash
npx tsx watch src/index.ts
curl http://localhost:3000/api/organizaciones/1/ranking?categoria=tercera
```

**Verificación:** el `curl` devuelve los 26 jugadores ordenados por puntos.

---

## Fase 4 — Tipos compartidos

**Objetivo:** que web y mobile consuman los mismos tipos que produce la API.

```bash
mkdir -p packages/shared/src/schemas
cd packages/shared && npm init -y
npm i zod
```

Definir en `src/schemas/ranking.ts` el schema de Zod de lo que devuelve el endpoint, y exportar el tipo inferido.

Que la API **importe ese schema** y valide su propia respuesta con él. Así, si alguien cambia el shape, rompe la compilación en vez de fallar en runtime.

> Este paso parece burocrático y es lo que justifica usar TypeScript en un proyecto de tres frontends. No lo salteen.

---

## Fase 5 — Web

```bash
cd apps
npm create vite@latest web -- --template react-ts
cd web
npm i @tanstack/react-query
```

**Una sola pantalla:** la tabla de ranking, consumiendo el endpoint de la Fase 3 con TanStack Query.

**Verificación:** abrir el navegador y ver los 26 jugadores con sus puntos.

---

## Fase 6 — Móvil

```bash
cd apps
npx create-expo-app@latest mobile
cd mobile
npm i @tanstack/react-query
```

**La misma pantalla de ranking**, reutilizando el hook y los tipos de `packages/shared`.

```bash
npx expo start
```

**Verificación:** escanear el QR con Expo Go y ver la tabla en el celular.

> **Este es el hito.** Un dato que está en Postgres, servido por Express, tipado por Zod, se ve en el celular. Todo lo que viene después es repetir este patrón con más entidades.

---

## Fase 7 — Cerrar

```bash
git add .
git commit -m "chore: esqueleto del monorepo con rebanada vertical de ranking"
git push
git tag -a setup-inicial -m "Rebanada vertical funcionando punta a punta"
git push origin setup-inicial
```

Verificar que los otros dos pueden clonar y levantar todo siguiendo el README. Si algo no está documentado ahí, agregarlo ahora.

---

## Lo que NO hacer todavía

| No hacer | Por qué |
|---|---|
| Dockerfiles de API y web | Fase 3-4 del cronograma. Primero que funcione local |
| Autenticación | Agrega complejidad antes de tener algo que proteger |
| MercadoPago | Necesita URL pública y mucho contexto. Etapa 4 |
| Diseño visual | Que funcione feo primero. Estilar después |
| Las otras 12 entidades del schema | Ya están en el schema, pero sin endpoints todavía |
| CI/CD | Cuando haya tests que correr |

---

## Checkpoint

Al terminar esta guía deberían poder responder que sí a todo:

- [ ] Los tres tienen el repo clonado y levantan el proyecto
- [ ] `docker compose up -d db` funciona
- [ ] El schema completo está migrado
- [ ] El seed carga 26 jugadores con puntos reales
- [ ] Un endpoint devuelve el ranking ordenado
- [ ] La web muestra la tabla
- [ ] El celular muestra la tabla
- [ ] Está todo commiteado y tagueado
- [ ] El README explica cómo levantarlo desde cero

Si algo falla, arreglarlo ahora. Cada uno de estos puntos es una dependencia de todo lo que viene.

---

## Siguiente paso

Con la rebanada vertical andando, la Etapa 2 es repetir el patrón para las entidades del núcleo: organizaciones, clubes, jugadores, torneos e inscripciones. Ahí sí se puede dividir el trabajo, porque el patrón ya lo entendieron los tres.
