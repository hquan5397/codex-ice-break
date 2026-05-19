# Admin Dashboard Summary

Status: implemented
Created: 2026-05-19 21:37

## Goal

Give the admin a quick overview of inventory health when they open the admin page. The summary should show key counts and recent activity so the admin can understand the current listing state without manually scanning every card.

## Users

- Primary user: store admin managing bike inventory
- Secondary user: developer maintaining admin inventory workflows

## User Stories

- As an admin, I want to see total listings, so that I know the size of current inventory.
- As an admin, I want to see selling and sold counts, so that I can understand active vs completed listings.
- As an admin, I want to see newest listings, so that I can quickly review recently added bikes.

## Scope

In scope:

- Add an admin dashboard summary section to the admin page.
- Show summary counts:
  - total listings
  - selling listings
  - sold listings
  - newest listings count or newest listings preview
- Add analytics persistence for dashboard reporting.
- Show revenue or sales amount reporting for sold listings.
- Add a date range filter for dashboard metrics.
- Keep the summary visible above the admin listing management area.
- Use backend-provided dashboard summary data instead of calculating all dashboard values only in the frontend.
- Keep existing create, edit, sold/selling, and image workflows unchanged.

Out of scope:

- Charts.
- Featured listings count until the featured listing feature exists.

## Acceptance Criteria

- Given an authenticated admin opens the admin page, when listings load, then a dashboard summary is visible above the listing management area.
- Given there are listings, when the summary renders, then total, selling, and sold counts match backend dashboard data.
- Given sold listings have sale amounts, when the summary renders, then revenue and sales amount totals match the selected date range.
- Given the admin changes the date range filter, when dashboard data reloads, then summary counts and revenue metrics update for that range.
- Given the admin sets a from date, when dashboard data reloads, then the range starts at the beginning of that date.
- Given the admin sets a to date, when dashboard data reloads, then the range ends at the end of that date.
- Given a listing is marked sold or selling, when the update succeeds, then summary counts update without a page refresh.
- Given a new listing is created, when creation succeeds, then total and selling counts update without a page refresh.
- Given a listing is edited, when the listing remains in the same sold/selling state, then summary counts remain correct.
- Given there are no listings, when the admin page loads, then summary counts show zero states cleanly.

## UX Requirements

- Summary appears near the top of the admin page, below the toolbar and above the main workspace/listing management content.
- Summary should use compact, scan-friendly cards or stat blocks.
- Date range filter should appear near the summary section and clearly control dashboard metrics.
- Revenue values should use the existing VND currency formatting style.
- Summary should feel like an admin tool, not a marketing hero.
- On mobile, summary blocks should wrap or stack without overlapping.
- Use existing visual style, spacing, and restrained colors.

## API Requirements

- Add an admin-protected dashboard summary endpoint.
- Method/path: `GET /api/admin/dashboard-summary`
- Request:
  - optional `from` date
  - optional `to` date
- Response:
  - total listings
  - selling listings
  - sold listings
  - sold listings in selected date range
  - revenue total in selected date range
  - newest listings preview
- Error cases:
  - invalid date range returns validation error.
  - unauthenticated requests return unauthorized.

## Data Requirements

- Entity: `Bike`
- Fields used:
  - `id`
  - `sold`
  - `price`
  - `createdAt`
  - `updatedAt`
  - `title`
  - `brand`
  - `model`
- Add analytics database table or tables for dashboard reporting.
- Analytics data should support sold date and sale amount reporting.
- Add TypeORM migration files for any schema changes.
- Decide how existing sold listings are represented in analytics during migration or first calculation.

## Security And Permissions

- Dashboard summary is visible only to authenticated admins.
- Do not expose sold listing counts or admin-only inventory data on public pages.
- Existing admin authentication behavior must remain unchanged.

## Test Plan

Backend:

- Unit tests:
  - dashboard summary requires admin authentication.
  - total, selling, and sold counts are correct.
  - revenue total respects date range.
  - date ranges normalize from dates to start of day and to dates to end of day.
  - invalid date ranges are rejected.
  - marking a listing sold updates analytics data.
- Build: run `npm run build`.
- Test: run `npm test`.
- Migration: run migration command if schema changes are added.

Frontend:

- Build: run frontend build.
- Manual checks:
  - Summary appears after admin login.
  - Counts match total, selling, and sold listings.
  - Revenue values match sold listing sale amounts.
  - Date range filter updates the summary.
  - Counts update after marking a bike sold/selling.
  - Counts update after creating a new listing.
  - Empty inventory shows zero counts.
  - Mobile layout remains readable.

## Docker And Runtime

- `docker compose up --build` should still start backend, frontend, and Postgres.
- No new environment variables required.

## Open Questions

- Should the newest listings summary show only a count, or show a short preview list of the latest bikes?
- Should sale amount default to the listing price when a bike is marked sold, or should admin enter a separate final sale price?
- Which date should revenue use: sold date, listing updated date, or a dedicated sale date?
