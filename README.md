#  setpoint

> Plataforma de gestión de torneos de tenis amateur  
> Web + app móvil instalable

---

##  Sobre el proyecto

**SetPoint** reemplaza el circuito actual de planillas de Excel, cuadros en papel y coordinación por WhatsApp.

**Features:**
-  Armado de zonas con siembra por ranking
-  Cuadros eliminatorios automáticos
-  Coordinación de partidos entre jugadores
-  Cobro de inscripciones integrado
-  Ranking que se actualiza automáticamente

---

##  Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Lenguaje** | TypeScript |
| **Web** | React + Vite |
| **Móvil** | React Native + Expo |
| **API** | Express + Prisma |
| **BD** | PostgreSQL |
| **Pagos** | MercadoPago |
| **Contenerización** | Docker |

**Monorepo** con workspaces de npm.

---

##  Requisitos

- Node.js 20+
- Docker y Docker Compose
- Para app móvil: Expo Go o emulador Android

---

##  Levantar el proyecto

### Con Docker (recomendado)

```bash
git clone https://github.com/jeremiasHerr/setpoint.git
cd setpoint
cp .env.example .env
docker compose up
```
## Desarrollado por
- Jeremías Herrera
- Tomas Mengon
- Dana Garcia

