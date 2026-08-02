# Project Agent Rules

This is a full-stack motorbike listing app with:

- NestJS + TypeScript backend
- TypeORM + PostgreSQL
- React + Vite frontend
- Docker Compose for local runtime

## Spec-Driven Design

- This project uses spec-driven design.
- Before implementing a feature, read the relevant spec in `specs/`.
- If no spec exists, create one from `specs/template.md` or ask the user for enough detail to write it.
- Keep backend and frontend changes aligned with the relevant spec.
- If requirements change while coding, update the spec in the same change.
- Keep future specs ordered by creation date in `specs/README.md`.

## Planning Workflow

- Before implementation, write the proposed plan to `PLAN.md`.
- Wait for user approval before implementing the plan.
- After approval, implement the approved plan.

## Multi-Agent Workflow

- For feature implementation work, spawn one additional review/inspection agent before or during implementation.
- Fold the review agent findings into the final changes before verification.
- For cross-stack work, keep inspection focused on:
  - backend API contracts, DTOs, persistence behavior, auth, and tests
  - frontend UI behavior, typed API calls, state flow, styling, and build impact

## README Updates

- Update `README.md` when changes affect setup, commands, workflows, APIs, Docker, specs, or user-facing behavior.

## Backend Rules

- Backend code lives in `backend/src/`.
- Use NestJS modules, controllers, services, DTOs, entities, and CQRS handlers rather than placing logic in `main.ts`.
- Put request validation rules in DTO classes with `class-validator`.
- Put persistence shape in TypeORM entities.
- Keep controller methods thin. Business logic belongs in services.
- Use environment variables for configuration. Do not hardcode database hosts, public URLs, ports, or upload paths.
- Uploaded image files are served from the configured `UPLOAD_DIR` through `/uploads`.

## Backend API Rules

- All API routes use the global `/api` prefix.
- Bike listing endpoints live under `/api/bikes`.
- Admin-only endpoints must use the existing admin auth guard.
- Create/update endpoints that accept images should use `multipart/form-data`.
- Accept only JPEG, PNG, and WebP images unless product requirements change.
- Keep upload size limits explicit.

## Database Rules

- Use TypeORM repositories through dependency injection.
- Use TypeORM migrations for schema changes.
- Keep `synchronize` disabled by default.
- Store prices as numeric/decimal-safe values, not floating-point database columns.

## Frontend Rules

- Frontend source code lives in `frontend/src/`.
- Use typed API functions in `frontend/src/api.ts` for backend communication.
- Keep React components accessible, responsive, and easy to scan.
- Prefer simple React hooks until the app grows enough to justify shared state tooling.
- Use `VITE_API_URL` for the API base URL.
- Do not hardcode production-only backend URLs in components.

## UI Rules

- The first screen should be the usable admin/listing experience, not a marketing landing page.
- Keep controls compact and practical for inventory management.
- Use icons for tool-like actions when a clear icon exists.
- Keep text readable on mobile and desktop.
- Avoid nested cards and overly decorative dashboard layouts.

## Verification

Backend changes:

```bash
cd backend
npm run build
npm test
```

Frontend changes:

```bash
cd frontend
npm run build
```

When dependencies change:

```bash
npm audit --omit=dev
```

## Docker

- Keep the backend container listening on port `3000`.
- Keep the frontend production container serving the built app on port `80`.
- Keep the Compose frontend host port as `5173` unless the root Docker setup changes.
- Keep Docker configuration compatible with root `docker-compose.yml`.
- Use lockfile-based installs in Docker builds.
