# Refactor TypeORM

Status: implemented
Created: 2026-05-18 12:16

## Goal

Make database schema changes safer by replacing TypeORM automatic schema synchronization with explicit migration files and migration commands.

## Users

- Primary user: backend developer maintaining the database schema
- Secondary users: store admin and customers relying on stable persisted listing data

## User Stories

- As a backend developer, I want schema changes captured in migration files, so that database changes are reviewable and repeatable.
- As a backend developer, I want to disable dangerous automatic schema sync, so that running the app does not unexpectedly alter or drop database structures.
- As an app operator, I want Docker startup and deployment to use predictable migration commands, so that data survives backend changes.

## Scope

In scope:

- Add a TypeORM data source configuration for CLI migration commands.
- Add a migrations folder for backend database migrations.
- Create an initial migration matching the current `Bike` table schema.
- Disable TypeORM `synchronize` by default.
- Add npm scripts for generating, running, and reverting migrations.
- Update Docker/runtime documentation or commands so migrations can be run safely.
- Keep existing API behavior unchanged.

Out of scope:

- Replacing TypeORM with another ORM.
- Redesigning the database schema.
- Adding seed data.
- Production deployment automation beyond migration command support.
- Frontend changes.

## Acceptance Criteria

- Given the backend starts, when no explicit sync flag is enabled, then TypeORM does not use automatic schema synchronization.
- Given a developer needs to change schema, when they create a migration, then the migration file is stored in the backend migrations folder.
- Given a fresh Postgres database, when migrations run, then the `bikes` table is created with fields matching the current `Bike` entity.
- Given existing migrations have run, when the backend starts, then existing API routes continue to work.
- Given a migration needs rollback, when the revert command runs, then TypeORM can revert the latest migration.
- Given Docker is used locally, when the developer runs the documented migration command, then migrations execute against the Compose Postgres service.

## UX Requirements

- No frontend UX changes.
- No admin/customer UI changes.

## API Requirements

- Preserve all existing backend API routes and response shapes.
- No request or response contract changes.

## Data Requirements

- Entity: `Bike`
- Initial migration should create the current `bikes` table shape:
  - `id`
  - `title`
  - `price`
  - `brand`
  - `model`
  - `year`
  - `mileage`
  - `description`
  - `imageUrl`
  - `imageUrls`
  - `sold`
  - `createdAt`
  - `updatedAt`
- Preserve numeric price precision and scale.
- Preserve nullable fields.
- Preserve JSON image URL list storage.
- Add or preserve TypeORM migration tracking table behavior.

## Security And Permissions

- Database credentials continue to come from environment variables.
- Do not hardcode production database credentials.
- Migration commands should use the same environment configuration pattern as the app.
- Production should not run destructive schema sync.

## Test Plan

Backend:

- Run `npm run build`.
- Run `npm test` after implementation.
- Run `npm audit --omit=dev` if dependencies or package scripts change.
- Manually run migration command against local Docker Postgres.
- Manually verify backend starts after migrations.

Frontend:

- No frontend build required unless frontend files change.

## Docker And Runtime

- `docker compose up --build` should still start the stack.
- Add a documented way to run migrations against the Compose database.
- The backend should not depend on `synchronize: true` to create or update tables.
- Local development may provide an explicit opt-in sync flag only if clearly documented as unsafe for production.

## Open Questions

- Docker runs pending migrations before starting the backend, and the manual command remains documented for local development.
- The first migration handles both fresh databases and existing local databases that already have the `bikes` table from earlier `synchronize` usage.
