# syntax=docker/dockerfile:1
#
# Image de production du frontend : build Angular (configuration « deploy », URL lues au
# démarrage depuis /config.js) servi par nginx non-root sur le port 8080.
# Publiée par la CI sur GHCR (logiflow-frontend) et déployée par logiflow-infra.

# --- Étape 1 : build ---
FROM node:26-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec ng build --configuration deploy

# --- Étape 2 : runtime nginx non-root ---
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-logiflow-config.sh /docker-entrypoint.d/40-logiflow-config.sh
COPY --from=build --chown=nginx:nginx /app/dist/logiflow-frontend/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
