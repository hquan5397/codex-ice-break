# Refactor Loading Strategy In Listing Page

Status: implemented
Created: 2026-05-18 21:10

## Goal

Improve the customer listing page loading experience so searching or filtering by brand does not feel like the whole page is reloading. The header, hero, search bar, brand filter, and page layout should stay stable while only the listing results area updates.

## Users

- Primary user: customer browsing bike listings
- Secondary user: store admin checking the customer-facing listing page

## User Stories

- As a customer, I want the page header and filters to stay visible when I search or filter, so that I do not lose context.
- As a customer, I want only the listing section to show loading feedback, so that search and filter changes feel fast and smooth.
- As a customer, I want stale search results to be avoided, so that the listings match my latest search and brand selections.

## Scope

In scope:

- Refactor the customer listing page loading state.
- Keep the page shell stable during search and brand filter changes.
- Show loading feedback inside the listing results area only.
- Keep search input and brand filter interactive while listings reload.
- Prevent older slower requests from overwriting newer search/filter results.
- Preserve current search and brand filtering behavior.

Out of scope:

- Backend API contract changes.
- New search/filter features.
- URL query synchronization.
- Pagination or infinite scrolling.
- Admin listing page loading changes.

## Acceptance Criteria

- Given a customer changes the search term, when listings are loading, then the page header, hero, search bar, brand filter, and refresh button remain visible.
- Given a customer changes selected brands, when listings are loading, then only the listing results area shows a loading state.
- Given the first page load is in progress, when no listings are loaded yet, then the listing area shows the existing loading state without replacing the whole page.
- Given listings already exist, when a new search/filter request starts, then the existing layout does not jump or reset to the top of the page.
- Given a slower previous request finishes after a newer request, when results are applied, then the UI keeps the newer request results.
- Given a request fails during search/filter reload, when existing listings are present, then the controls remain usable and the error appears in the listing area.

## UX Requirements

- Search bar remains on the left of the brand filter.
- Brand filter remains open/usable unless the user closes it.
- Brand filter dropdown must render above listing cards and loading overlays.
- Listing grid area may show a compact loading indicator, skeleton, or subtle overlay while preserving the page shell.
- Avoid full-page empty/loading states for search and filter changes after the page has mounted.
- Keep mobile layout stable with controls stacked in order:
  - search
  - brand filter
  - refresh

## API Requirements

- No API changes.
- Continue using `GET /api/bikes` with optional `search` and repeated `brand` query parameters.
- Preserve existing response shape and error handling.

## Data Requirements

- No database schema changes.
- No migration required.

## Security And Permissions

- Public listing behavior remains public.
- Sold bikes must remain hidden from public listing results.
- Admin-only endpoints remain unchanged.

## Test Plan

Backend:

- No backend changes expected.
- If backend files change unexpectedly, run `npm run build` and `npm test`.

Frontend:

- Build: run frontend build.
- Manual checks:
  - First customer page load shows loading only in the listing area.
  - Search does not visually reload the whole page.
  - Brand filter changes do not visually reload the whole page.
  - Search and brand filters remain visible and usable during loading.
  - Brand filter dropdown appears in front of listing cards and loading indicators.
  - Slow or repeated search/filter changes do not show stale results.
  - Mobile layout remains stable.

## Docker And Runtime

- `docker compose up --build` should still start backend, frontend, and Postgres.
- No environment variable changes.

## Open Questions

- Should listing reloads keep existing cards visible with a subtle loading overlay, or replace the grid with a compact loading state?
