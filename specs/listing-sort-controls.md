# Listing Sort Controls

Status: implemented
Created: 2026-05-20 22:49

## Goal

Allow customers to sort visible bike listings by newest and price, so they can browse inventory in the order that best matches their buying intent. Sorting should work together with existing search, brand filters, pinned listings, and sold-listing visibility rules.

## Users

- Primary user: customer browsing available bikes
- Secondary user: store admin who wants customer-facing inventory to be easier to scan

## User Stories

- As a customer, I want to sort listings by newest, so that I can quickly see recently added bikes.
- As a customer, I want to sort listings by price low to high, so that I can find affordable bikes first.
- As a customer, I want to sort listings by price high to low, so that I can compare premium bikes first.
- As a customer, I want pinned bikes to remain highlighted while sorting, so that store-prioritized bikes are still easy to find.

## Scope

In scope:

- Add sort controls to the customer listing page.
- Support these sort options:
  - newest first
  - price low to high
  - price high to low
- Keep default behavior as newest first.
- Combine sorting with existing search and multi-brand filtering.
- Preserve public visibility rule: sold bikes are never shown on the customer listing page.
- Preserve pinned-listing priority while applying the selected sort inside pinned and unpinned groups.
- Add backend API support so sorting is handled by the public listing endpoint.

Out of scope:

- Admin listing sort controls.
- Sorting by mileage, year, brand, or title.
- Persisting sort selection in user accounts.
- URL query synchronization for the first version.

## Acceptance Criteria

- Given a customer first opens the listing page, when no sort option is changed, then listings appear newest first.
- Given the customer selects price low to high, when listings reload, then matching selling listings are ordered by price ascending.
- Given the customer selects price high to low, when listings reload, then matching selling listings are ordered by price descending.
- Given pinned listings exist, when any sort option is selected, then pinned listings appear before unpinned listings and are sorted by the selected option within the pinned group.
- Given the customer enters a search term, when a sort option is selected, then search filtering and sort ordering both apply.
- Given the customer selects one or more brands, when a sort option is selected, then brand filtering and sort ordering both apply.
- Given a sold listing matches the selected filters, when listings load, then the sold listing is still excluded.
- Given an invalid sort value is sent to the API, when validation runs, then the API rejects it with a validation error.

## UX Requirements

- Sort control appears in the customer inventory tools area with search and brand filters.
- Layout order on desktop should be:
  - search
  - brand filter
  - sort control
  - refresh button
- Mobile layout should stack controls in the same order.
- Sort control should use a native select or compact menu matching existing form styling.
- Sort labels should be easy to understand:
  - `Newest`
  - `Price: Low to high`
  - `Price: High to low`
- Changing sort should only reload the listing results area, not the whole page.
- Existing dropdown stacking behavior must remain correct, with menus appearing above listing cards.

## API Requirements

- Extend public listing endpoint.
- Method/path: `GET /api/bikes`
- Request:
  - optional repeated `brand`
  - optional `search`
  - optional `sort`
- Supported `sort` values:
  - `newest`
  - `price_asc`
  - `price_desc`
- Default sort: `newest`
- Response:
  - same bike listing shape as current public response
- Error cases:
  - invalid sort value returns validation error.
  - existing search validation remains unchanged.

## Data Requirements

- Entity: `Bike`
- Fields used:
  - `sold`
  - `pinned`
  - `createdAt`
  - `price`
  - `brand`
  - `title`
  - `model`
- No database schema change required.
- Price sorting should treat `price` as numeric, not text.

## Security And Permissions

- Sorting is available publicly and does not require authentication.
- Sorting must not expose sold listings.
- Admin-only listing data and endpoints remain unchanged.

## Test Plan

Backend:

- Unit tests:
  - DTO accepts valid sort values.
  - DTO rejects invalid sort values.
  - public listing query defaults to newest ordering.
  - public listing query supports price ascending.
  - public listing query supports price descending.
  - pinned listings remain first for all sort options.
  - search and brand filters combine with sort.
- Build: run `npm run build`.
- Test: run `npm test`.

Frontend:

- Build: run frontend build.
- Manual checks:
  - default listing order remains newest.
  - sort control appears beside search and brand controls.
  - selecting each sort option reloads only the listing results area.
  - search and brand filters continue to work with selected sort.
  - pinned listing badges and ordering remain correct.
  - mobile controls stack cleanly.

## Docker And Runtime

- `docker compose up --build` should still start backend, frontend, and Postgres.
- No migration is required.
- No new environment variables required.

## Open Questions

- Should sort selection be reflected in the browser URL in a later version?
- Should pinned priority be optional for price sorting, or always preserved as specified here?
