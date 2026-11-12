# API de SetPoint. Se construye desde la raíz del repo: docker build -f apps/api/Dockerfile .
# Corre con tsx, sin compilar, porque packages/shared se consume como TypeScript (decisión 085).
FROM node:22-slim

# Prisma necesita OpenSSL, y la imagen slim no lo trae.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Primero las dependencias, para que un cambio en el código no las vuelva a instalar.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/shared/package.json packages/shared/
# El postinstall de la API corre prisma generate, que lee el schema.
COPY apps/api/prisma apps/api/prisma
RUN npm ci -w apps/api -w packages/shared

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 3000
# Migraciones, el seed si corresponde, y la API.
CMD ["npm", "run", "start:contenedor"]
