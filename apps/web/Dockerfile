# Web de SetPoint. Se construye desde la raíz del repo: docker build -f apps/web/Dockerfile .
# Se compila con Vite y la sirve nginx, que además le pasa /api a la API (decisión 085).
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/shared/package.json packages/shared/
RUN npm ci -w apps/web -w packages/shared --ignore-scripts

COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build -w apps/web

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
