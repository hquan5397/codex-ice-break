# Listing Sort Controls Implementation Plan

## Summary

Implement customer-facing listing sort controls so users can sort available bikes by newest, price low to high, or price high to low. Sorting will be handled by the backend public listing API and will preserve pinned-first ordering, search, brand filtering, and sold-listing exclusion.

## Proposed Changes

### Backend

- Add a public listing sort enum/type with supported values:
  - `newest`
  - `price_asc`
  - `price_desc`
- Extend `GetPublicBikesDto` with optional `sort`.
- Extend `GetPublicBikesQuery` and handler flow to pass `sort` into `BikesService.findAll`.
- Update `BikesService.findAll(brands, search, sort)` query builder:
  - always filter `bike.sold = false`
  - apply optional brand filter
  - apply optional search filter
  - always order `bike.pinned DESC` first
  - for `newest`, order `bike.createdAt DESC`
  - for `price_asc`, order numeric price ascending, then newest
  - for `price_desc`, order numeric price descending, then newest
- No database migration.

### Frontend

- Add a `sort` value to customer page state, defaulting to `newest`.
- Extend `getBikes` params/API query builder to send `sort`.
- Add a compact sort select after the brand filter and before refresh.
- Use labels:
  - `Newest`
  - `Price: Low to high`
  - `Price: High to low`
- Keep listing refresh scoped to the listing results area.
- Keep mobile control order as search, brand filter, sort, refresh.

### Specs And Docs

- Mark `specs/listing-sort-controls.md` as `implemented` after verification.
- Update `specs/README.md` status for `Listing Sort Controls`.
- Update `features-to-be-implemented.MD` to mark `Listing sort controls by newest and price` as `implemented`.
- Update root `README.md` to document the new optional public API `sort` parameter.

## Review Agent Step

- Spawn one review agent during implementation to inspect backend and frontend changes together.
- Fold actionable findings into the final patch before verification.

## Test Plan

Backend:

- Add/update unit tests for:
  - DTO accepts `newest`, `price_asc`, and `price_desc`.
  - DTO rejects invalid sort values.
  - controller forwards brand, search, and sort to CQRS query.
  - CQRS handler forwards sort to service.
  - service defaults to pinned-first and newest ordering.
  - service applies pinned-first plus numeric price ascending.
  - service applies pinned-first plus numeric price descending.
  - search and multi-brand filters still combine with sort.
- Run:
  - `cd backend && npm run build`
  - `cd backend && npm test`

Frontend:

- Run:
  - `cd frontend && npm run build`
- Manual checks:
  - sort control appears in the customer tools row.
  - changing sort reloads listing results only.
  - search and brand filters continue to work with selected sort.
  - pinned/featured listings remain first within the selected sort.
  - mobile layout stacks cleanly.

Docker:

- If Docker is running, run `docker compose up --build -d`.
- If Docker is unavailable, record the reason.

## Risks And Mitigations

- Risk: numeric price sorting could accidentally sort text values lexicographically.
  - Mitigation: cast numeric price in the TypeORM query ordering.
- Risk: price sorting could override pinned priority.
  - Mitigation: keep `bike.pinned DESC` as the first order clause for every sort.
- Risk: adding another customer control could crowd the tools row.
  - Mitigation: reuse existing select styling and responsive stacking.

## Open Decisions

- Use `newest`, `price_asc`, and `price_desc` as API values unless you prefer different query names.
- Keep pinned priority always on for all sort modes.
