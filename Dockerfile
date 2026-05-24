# ---------- Base ----------
FROM node:24-slim AS base
WORKDIR /app

RUN corepack enable


# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# ---------- Build ----------
FROM deps AS build

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_GOOGLE_MAPS_API_KEY=not-configured
ARG VITE_NODE_ENV=production
ARG VITE_APP_NAME="Smart Parking"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    VITE_NODE_ENV=$VITE_NODE_ENV \
    VITE_APP_NAME=$VITE_APP_NAME

COPY . .
RUN pnpm build


# ---------- Development ----------
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0"]


# ---------- Production ----------
FROM nginx:alpine-slim AS production
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
