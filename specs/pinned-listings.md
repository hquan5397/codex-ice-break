# Pinned Listings

Status: implemented
Created: 2026-05-20 22:08

## Goal

Allow the admin to mark important listings as pinned so they appear before normal listings on the customer listing page. This helps the store highlight priority bikes without changing the normal listing creation and editing flow.

## Users

- Primary user: store admin managing bike inventory
- Secondary users: customers browsing available bikes

## User Stories

- As an admin, I want to pin a listing, so that important bikes appear first for customers.
- As an admin, I want to unpin a listing, so that the bike returns to the normal listing order.
- As a customer, I want pinned bikes to appear clearly near the top, so that I notice highlighted bikes first.

## Scope

In scope:

- Add a `pinned` field to bike listings.
- Add admin controls to turn pinned status on or off.
- Show pinned listings before unpinned listings on the customer listing page.
- Preserve existing search, brand filter, sold filtering, listing detail, and PDF export behavior.
- Keep sold bikes hidden from the customer listing page even when pinned.
- Add a TypeORM migration for the new field.

Out of scope:

- Paid promotion or campaign scheduling.
- Pin expiration dates.
- Separate landing page sections for promotions.
- Drag-and-drop ordering among pinned listings.

## Acceptance Criteria

- Given an admin views the admin listing page, when a listing is selling, then the admin can mark it as pinned or unpinned.
- Given a listing is pinned, when customers view listings, then that listing appears before unpinned listings.
- Given multiple listings are pinned, when customers view listings, then pinned listings are ordered newest first within the pinned group.
- Given listings are unpinned, when customers view listings, then they keep the current newest-first order after pinned listings.
- Given a pinned listing is marked sold, when customers view listings, then the sold listing is not shown.
- Given customers search or filter by brand, when results include pinned listings, then matching pinned listings still appear before matching unpinned listings.
- Given an admin edits a listing, when the save succeeds, then pinned status is preserved unless changed by the admin.
- Given the app runs migrations, when the new migration is applied, then existing listings default to unpinned.

## UX Requirements

- Admin listing cards should show a clear pinned/selling priority control.
- The pinned control should be aligned with existing admin action buttons and should not disturb the edit, sold/selling, image, or PDF controls.
- Customer listing cards should show a small visual "Pinned" or "Featured" indicator for pinned listings.
- Pinned customer cards should use the existing visual style and avoid looking like a separate marketing banner.
- Search input, brand filter, and refresh controls should remain interactive while listing results reload.
- Mobile layouts must keep the pinned indicator and action buttons readable without overlap.

## API Requirements

- Extend bike create/update/admin listing APIs to include pinned status where appropriate.
- Public listing response should include pinned status if needed for the customer UI indicator.
- Sorting for public listings should be:
  - pinned listings first
  - then newest first by `createdAt DESC`
- Error cases:
  - invalid pinned values are rejected by validation.
  - unauthenticated admin requests to update pinned status return unauthorized.

## Data Requirements

- Entity: `Bike`
- New field:
  - `pinned: boolean`
  - default: `false`
  - required at database level
- Add a TypeORM migration to add the `pinned` column with a safe default for existing rows.
- No separate analytics table is required for the first version.

## Security And Permissions

- Only authenticated admins can create or update pinned status.
- Customers can see whether a public listing is pinned, but cannot change it.
- Existing admin authentication and authorization behavior must remain unchanged.

## Test Plan

Backend:

- Unit tests:
  - create listing defaults pinned to false when omitted.
  - admin can create or update pinned status.
  - public listing query returns unsold pinned listings before unpinned listings.
  - public listing query combines pinned ordering with search and brand filters.
  - sold pinned listings are excluded from customer results.
- Build: run `npm run build`.
- Test: run `npm test`.
- Migration: run migration command after adding the new field.

Frontend:

- Build: run frontend build.
- Manual checks:
  - Admin can pin and unpin a listing.
  - Pinned state remains visible after page reload.
  - Customer page shows pinned listings first.
  - Pinned indicator appears on customer listing cards.
  - Search and brand filters preserve pinned-first ordering.
  - Sold pinned listings do not appear on the customer page.
  - Mobile layout remains readable.

## Docker And Runtime

- `docker compose up --build` should still start backend, frontend, and Postgres.
- Backend container should run pending migrations before API startup.
- No new environment variables required.

## Open Questions

- Should the admin be able to pin sold listings, even though they are hidden from customers?
- Should the customer indicator text be `Pinned`, `Featured`, or Vietnamese store-specific wording?
- Should pinned listings have a maximum count to prevent every listing from being pinned?
