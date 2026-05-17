FROM node:24-slim AS base
WORKDIR /app

RUN corepack enable

# --- Dependencies Stage ---
FROM base AS deps
COPY package.json  pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -- Build the app --
FROM deps AS build
COPY . .
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else pnpm build; \
  fi

# --- Development Stage ---
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Production Stage ---
FROM nginx:alpine-slim AS production
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
