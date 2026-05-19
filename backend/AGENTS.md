# Backend Agent Rules

This backend is a NestJS API for motorbike listings.

## Spec-Driven Design

- This project uses spec-driven design.
- Before implementing a backend feature, read the relevant spec in `../specs/`.
- If no spec exists, create one from `../specs/template.md` or ask the user for enough detail to write it.
- Do not implement broad feature changes from a `draft` spec unless the user explicitly asks for a prototype.
- Keep API behavior, validation, database changes, and tests aligned with the spec.
- If requirements change while coding, update the spec in the same change.

## Multi-Agent Workflow

- For future implementations that touch both backend and frontend, use parallel agents to inspect backend and frontend before coding.
- For feature implementation work, spawn one additional review/inspection agent before or during implementation and fold its findings into the final changes before verification.
- Keep the backend inspection focused on API contracts, DTOs, persistence behavior, auth, and tests.
- Coordinate with the frontend findings before making cross-stack changes.

## Stack

- NestJS with TypeScript
- TypeORM
- PostgreSQL
- Multer for image uploads
- Docker-compatible runtime

## Conventions

- Keep backend code inside `src/`.
- Use NestJS modules, controllers, services, DTOs, and entities rather than placing logic in `main.ts`.
- Put request validation rules in DTO classes with `class-validator`.
- Put persistence shape in TypeORM entities.
- Keep controller methods thin. Business logic belongs in services.
- Use environment variables for configuration. Do not hardcode database hosts, public URLs, ports, or upload paths.
- Uploaded image files are served from the configured `UPLOAD_DIR` through `/uploads`.

## API Rules

- All API routes use the global `/api` prefix.
- Bike listing endpoints live under `/api/bikes`.
- Create endpoints that accept images should use `multipart/form-data`.
- Accept only JPEG, PNG, and WebP images unless the product requirements change.
- Keep upload size limits explicit.

## Database Rules

- Use TypeORM repositories through dependency injection.
- Keep `synchronize: true` only for local/development starter use.
- Before production, replace schema sync with migrations.
- Store prices as numeric/decimal-safe values, not floating-point database columns.

## Verification

Before considering backend changes complete, run:

```bash
npm run build
```

After every backend feature implementation, run unit tests:

```bash
npm test
```

When dependencies change, also run:

```bash
npm audit --omit=dev
```

## Docker

- Keep the backend container listening on port `3000`.
- Keep Docker configuration compatible with the root `docker-compose.yml`.
- Use lockfile-based installs in Docker builds.
