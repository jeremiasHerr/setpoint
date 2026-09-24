# Cómo trabajamos

Detalle completo en [docs/08-repositorio.md](docs/08-repositorio.md). Esto es el resumen para tener a mano.

## Ramas

- `main` siempre funciona: en cualquier momento se tiene que poder clonar y levantar.
- Ramas cortas, de 2 o 3 días como máximo.
- Nombre: prefijo + módulo + qué.

```
feat/competencia-desempates
fix/ranking-casillero-duplicado
docs/actualizar-dominio
chore/setup-docker
```

## Commits

```
feat(competencia): cascada de desempates con tests
fix(pagos): idempotencia del webhook
docs(dominio): corregir modelo de ranking
chore: configurar workspaces
```

## Pull requests

- **Código: siempre por PR**, con una aprobación de cualquiera de los otros dos.
- **Documentación: push directo a `main`.**
- Los tres leen todos los PR, aunque alcance con una aprobación para mergear.

## Reglas que no se negocian

- **Un cambio de diseño va en el mismo commit que el código que lo implementa.** Si cambia el motor de desempates, cambia `docs/02-dominio.md`.
- **Cuando se cierra una decisión, se tacha en `docs/README.md`** en ese mismo commit, con el motivo.
- **Nunca commitear `.env`**, credenciales de MercadoPago ni claves de API.
- **El schema vive en un solo lugar:** `apps/api/prisma/schema.prisma`. Las migraciones de `prisma/migrations/` se commitean.
- **Juntos la primera vez de cada patrón**, divididos las repeticiones.

## Entregas

Al entregar, se taguea el commit:

```bash
git tag -a entrega-25 -m "Entrega 25%"
git push origin entrega-25
```
