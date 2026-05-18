# Search Listing

Status: implemented
Created: 2026-05-18 20:55

## Goal

Let customers quickly find bike listings by typing a search term that matches the bike title, brand, or model. The search control should sit beside the existing brand category filter so browsing and filtering feel like one workflow.

## Users

- Primary user: customer browsing available bikes
- Secondary user: store admin verifying how listings appear to customers

## User Stories

- As a customer, I want to search listings by title, brand, or model, so that I can quickly find a specific bike.
- As a customer, I want the search bar near the brand filter, so that search and category filtering are easy to use together.
- As a customer, I want all listings to show when the search bar is empty, so that the default page remains broad.

## Scope

In scope:

- Add a search bar to the customer listing page.
- Position the search bar to the left of the brand category filter.
- Adjust the search/filter controls slightly to the left so they feel aligned with the inventory heading.
- Search available customer listings by:
  - title
  - brand
  - model
- Combine search with existing multi-select brand filtering.
- Keep the default customer page behavior as all unsold listings when no search term or brand filter is active.

Out of scope:

- Admin listing search.
- Fuzzy matching or typo correction.
- Search by price, year, mileage, description, or sold status.
- Full-text search indexes.
- Pagination.

## Acceptance Criteria

- Given a customer opens the listing page, when the search input is empty and no brands are selected, then all unsold listings are shown.
- Given a customer searches by bike title, when matching unsold listings exist, then matching listings are shown.
- Given a customer searches by brand name, when matching unsold listings exist, then matching listings are shown.
- Given a customer searches by model, when matching unsold listings exist, then matching listings are shown.
- Given a customer selects one or more brand filters and enters a search term, when listings are loaded, then only unsold listings matching both the selected brands and search term are shown.
- Given no listings match the search/filter combination, when loading completes, then the existing empty-state style is shown.
- Given a customer clears the search input, when no brand filter is active, then all unsold listings are shown again.

## UX Requirements

- Search bar appears on the left side of the category filter in the customer inventory header area.
- Search bar placeholder should clearly mention title, brand, or model.
- Search/filter controls should align visually with the inventory heading and be nudged left compared with the current filter-only layout.
- Search should not require a full page reload.
- Search should work on desktop and mobile without overlapping the brand filter or refresh button.
- On mobile, controls may stack but should keep search before category filter.

## API Requirements

- Method/path: `GET /api/bikes`
- Request:
  - optional query parameter `search`
  - existing optional repeated `brand` query parameter
- Response: existing bike listing response shape.
- Behavior:
  - if `search` is omitted or blank, do not apply search filtering.
  - if `search` is present, return unsold listings where title, brand, or model contains the term.
  - search should be case-insensitive.
  - if brand filters are also present, return listings matching both brand filter and search term.
- Error cases:
  - overly long search terms should return a validation error.

## Data Requirements

- Entity: `Bike`
- Fields used for search:
  - `title`
  - `brand`
  - `model`
- No database schema change required.
- No TypeORM migration required unless implementation chooses to add an index.

## Security And Permissions

- Customer search is public.
- Search must continue to exclude sold listings from the public endpoint.
- Admin-only endpoints remain unchanged.

## Test Plan

Backend:

- Unit tests: search by title.
- Unit tests: search by brand.
- Unit tests: search by model.
- Unit tests: search combined with multiple brand filters.
- Unit tests: blank search returns all unsold listings.
- Unit tests: overly long search term is rejected.
- Build: run `npm run build`.
- Test: run `npm test`.

Frontend:

- Build: run frontend build.
- Manual checks:
  - Search bar appears left of the brand category filter.
  - Search by title filters listings.
  - Search by brand filters listings.
  - Search by model filters listings.
  - Search and category filters work together.
  - Mobile layout does not overlap.

## Docker And Runtime

- `docker compose up --build` should still start backend, frontend, and Postgres.
- No new environment variables are required.

## Open Questions

- Should the search term be reflected in the URL query string so customers can share searched listing pages?
