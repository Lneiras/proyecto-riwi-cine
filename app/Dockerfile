# ============================================================
# Dockerfile multi-stage para la API Node.js (HU-001, Task 1)
# ------------------------------------------------------------
#  - build:      compila TypeScript a dist/
#  - production: imagen final liviana que ejecuta dist/index.js
#
# En desarrollo, docker-compose sobreescribe el comando con
# ts-node-dev (hot-reload). Esta imagen queda lista para producción.
# ============================================================

FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Instalar dependencias primero para aprovechar la caché de capas
COPY package*.json ./
RUN npm install

# Compilar TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ----------------- Producción -----------------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Código compilado desde la etapa build
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
