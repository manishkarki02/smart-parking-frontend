# ---------- Base ----------
FROM node:24-slim AS base
WORKDIR /app

RUN corepack enable

ENV PNPM_STORE_DIR=/pnpm/store


# ---------- Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set store-dir "$PNPM_STORE_DIR" \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-retry-mintimeout 20000 \
    && pnpm config set fetch-retry-maxtimeout 120000 \
    && pnpm config set fetch-timeout 600000 \
    && pnpm config set network-concurrency 8
RUN --mount=type=cache,id=smart-parking-frontend-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


# ---------- Build ----------
FROM deps AS build

ARG VITE_GOOGLE_MAPS_API_KEY=not-configured
ARG VITE_NODE_ENV=production
ARG VITE_APP_NAME="Smart Parking"

ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
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
