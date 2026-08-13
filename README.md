# Sajilo Parking Frontend

React client for Sajilo Parking. It uses TypeScript, Vite, TanStack Router and Query, Zustand, Tailwind CSS, shadcn-style components, and Google Maps.

## Docker Development

Start the frontend dev server with Docker:

```bash
docker compose -f docker-compose-dev.yml up --build
```

The app runs on `http://localhost:5173` by default. If the port is already in
use, override it without editing the compose file:

```bash
FRONTEND_PORT=5174 docker compose -f docker-compose-dev.yml up --build
```

PowerShell:

```powershell
$env:FRONTEND_PORT="5174"; docker compose -f docker-compose-dev.yml up --build
```

## API Routing

Frontend API requests intentionally use the same-origin `/api` path. In Docker
development, Vite proxies `/api` to the backend service. In production, Nginx
serves the built frontend and proxies `/api` to the backend container. The
frontend build does not read `VITE_API_BASE_URL`, which keeps browser requests
independent of Docker-internal service names and avoids adding CORS requirements.

## Mock Data

Mock parking locations are disabled by default. Set
`VITE_ENABLE_MOCK_PARKINGS=true` only when you intentionally want development
parking-slot results supplemented with local mock locations.

## Local Development

```bash
pnpm install
pnpm dev
```

The development server runs on `http://localhost:5173` and proxies `/api` to the backend.
