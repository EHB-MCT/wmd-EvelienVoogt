## Purpose

Short, actionable guidance for AI coding agents working on this repository.

## Big picture

- Two-part monorepo: a minimal Express backend and a placeholder frontend. Key locations:
  - `backend/src/index.js` — main Express app (simple, CommonJS)
  - `frontend/src/main.js` — frontend entry (currently empty)
  - `docker-compose.yml` — orchestrates `backend` and `db` services
  - `migrations/` — DB migrations present; `backend/knexfile.js` expected

## Quick start (local)

Set required environment variables, then build and run with Docker Compose. Example (PowerShell):

```powershell
$env:BACKEND_PORT=3000
$env:POSTGRES_PORT=5432
$env:POSTGRES_DB=appdb
$env:POSTGRES_USER=appuser
$env:POSTGRES_PASSWORD=secret
docker-compose up --build
```

Notes:

- `backend` listens on port `process.env.BACKEND_PORT || 3000` (see `backend/src/index.js`).
- Docker Compose maps `${BACKEND_PORT}:3000` and exposes Postgres using `${POSTGRES_PORT}`.

## Conventions & patterns (discoverable in repo)

- Node runtime: project uses CommonJS (`backend/packages.json` has `type: "commonjs"`).
- Express routing pattern: add route files under `backend/src/routes/` and corresponding service logic under `backend/src/services/`.
  - Current `backend/src/index.js` mounts a single route (`app.get('/', ...)`). New routes should follow Express Router patterns and be mounted from `index.js`.
- Database: Postgres managed by Docker Compose; migrations live in `migrations/`. Expect a `knexfile` in `backend/` (folder exists).

## File-specific guidance for agents

- `backend/src/index.js`: keep existing simple server behaviour. When adding features, register Routers from `backend/src/routes/` and keep config via env vars.
- `backend/packages.json`: use `npm run start` -> `node src/index.js`. Preserve scripts or update consistently.
- `docker-compose.yml`: use it as canonical run configuration (env-var-driven). Respect healthcheck for `db` (services depend_on uses it).
- `frontend/src/main.js`: verify framework before changing — currently empty; do not assume React/Vue unless you find package files or Dockerfile hints.

## Integration points & external dependencies

- Postgres: Docker Compose `db` service with `POSTGRES_*` env variables and a `pgdata` volume.
- If you need DB migrations or queries, look for `migrations/` and the (empty) `backend/knexfile.js` placeholder.

## What agents should do first when working on a task

1. Open `backend/src/index.js` to confirm current routes and port handling.
2. Check `docker-compose.yml` and `backend/packages.json` for how the app is started and which env vars are required.
3. If the task touches the frontend, inspect `frontend/Dockerfile` and `frontend/src/main.js` to determine framework or build steps.

## Examples

- Adding a new API route: create `backend/src/routes/myRoute.js` exporting an Express Router, then in `backend/src/index.js` add `app.use('/api/my-route', require('./routes/myRoute'))`.
- Running locally: use `docker-compose up --build` (see Quick start).

## Safety & scope

- Do not make assumptions about frontend tooling or frameworks; confirm via `frontend/Dockerfile` or package manifests before scaffolding UI code.
- Preserve existing `start` script in `backend/packages.json` unless explicitly asked to change run semantics.

## If something is missing

- If `knexfile` or DB config is required but empty, create minimal config under `backend/knexfile.js` and document it in a PR.

---

If any of these areas are unclear or you want more specifics (tests, CI, or expected API shapes), tell me which area to expand.
