# Backend CQRS Apply

Status: implemented
Created: 2026-05-18 11:36

## Goal

Refactor the NestJS backend to use the CQRS pattern with the official NestJS CQRS library, while preserving the current API behavior for motorbike listings and admin authentication.

## Users

- Primary user: backend developer maintaining the API
- Secondary users: frontend app and admin/customer API consumers

## User Stories

- As a backend developer, I want commands and queries separated, so that write behavior and read behavior are easier to understand and test.
- As a backend developer, I want to use NestJS built-in CQRS tooling, so that the implementation follows established NestJS patterns.
- As a frontend consumer, I want existing API responses and routes to keep working, so that the frontend does not need behavior changes.

## Scope

In scope:

- Install and use `@nestjs/cqrs`.
- Add `CqrsModule` to the backend module structure.
- Refactor bike write operations into command classes and command handlers.
- Refactor bike read operations into query classes and query handlers.
- Keep controllers thin by dispatching commands through `CommandBus` and queries through `QueryBus`.
- Keep TypeORM repository access inside handlers or focused persistence helpers.
- Preserve current API routes, request formats, response shapes, validation, guards, and upload behavior.
- Keep existing tests passing and update tests to cover handlers where useful.

Out of scope:

- Frontend changes.
- API route redesign.
- Event sourcing.
- Async message queues.
- Database schema changes unless required by the refactor.
- Changing authentication behavior.

## Acceptance Criteria

- Given the backend starts, when `BikesModule` loads, then CQRS command and query handlers are registered.
- Given a customer requests listings, when `GET /api/bikes` is called, then the controller executes a query and returns the same public listing behavior as before.
- Given an admin requests listings, when `GET /api/bikes/admin` is called, then the controller executes a query and preserves admin-only behavior.
- Given a customer requests listing details, when `GET /api/bikes/:id` is called, then the controller executes a query and preserves not-found behavior.
- Given an admin creates a listing, when `POST /api/bikes` is called, then the controller executes a command and preserves upload validation, image handling, and response shape.
- Given an admin edits a listing, when `PATCH /api/bikes/:id` is called, then the controller executes a command and preserves edit behavior, image ordering, and response shape.
- Given an admin updates sold status, when `PATCH /api/bikes/:id/sold` is called, then the controller executes a command and preserves sold filtering behavior.
- Given existing unit tests run, when the refactor is complete, then tests pass and cover CQRS handlers or controller bus dispatch behavior.

## UX Requirements

- No frontend UX changes.
- Existing frontend flows must continue to work without modification.

## API Requirements

- Preserve existing routes:
  - `GET /api/bikes`
  - `GET /api/bikes/admin`
  - `GET /api/bikes/:id`
  - `POST /api/bikes`
  - `PATCH /api/bikes/:id`
  - `PATCH /api/bikes/:id/sold`
- Preserve existing request formats:
  - JSON for sold status updates.
  - `multipart/form-data` for create and edit image operations.
- Preserve existing response shape, including `imageUrl`, `imageUrls`, `sold`, timestamps, and listing fields.
- Preserve existing error behavior for validation, auth, and not-found cases.

## Data Requirements

- No planned database schema changes.
- Existing `Bike` entity remains the persistence model.
- Existing image storage behavior remains unchanged.
- Repository access should be organized through CQRS handlers or a focused persistence service.

## Security And Permissions

- Preserve existing JWT admin guard behavior.
- Public customer queries remain public.
- Admin commands and admin query remain protected.
- Upload validation and cleanup behavior must remain intact.

## Test Plan

Backend:

- Add or update unit tests for bike command handlers.
- Add or update unit tests for bike query handlers.
- Update controller tests to verify command/query bus dispatch or preserve controller behavior through mocked buses.
- Run `npm run build`.
- Run `npm test` after implementation.
- Run `npm audit --omit=dev` if `@nestjs/cqrs` is added or package files change.

Frontend:

- No frontend build required unless frontend files change.
- Manually confirm existing frontend flows if the app is started after backend refactor.

## Docker And Runtime

- The backend should run in Docker with the same environment variables.
- `docker compose up --build` should still start Postgres, backend, and frontend.
- Backend container should continue listening on port `3000`.

## Open Questions

- Should repository access stay in CQRS handlers directly, or should handlers call a smaller `BikesRepository`/persistence service wrapper?
- Should auth flows also move to CQRS later, or should this refactor focus only on `BikesModule` first?
