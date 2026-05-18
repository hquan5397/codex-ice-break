# Bike Category

Status: implemented
Created: 2026-05-18 14:05

## Goal

Let customers browse bike listings by brand while keeping the first page load broad and simple. Admins should choose a bike brand from a controlled dropdown when creating or editing a listing, so listing data stays consistent.

## Users

- Primary user: customer browsing available bikes
- Secondary user: admin creating or editing bike listings

## User Stories

- As a customer, I want to choose a bike brand from a dropdown, so that I can quickly see listings from that brand.
- As a customer, I want the listing page to show all brands by default, so that I can browse everything without making a choice first.
- As an admin, I want to choose the bike brand from a fixed list, so that listing data does not contain inconsistent brand names.

## Scope

In scope:

- Add a bike brand enum with these values:
  - Honda
  - Yamaha
  - Suzuki
  - Kawasaki
  - Benelli
  - Triumph
  - Harley-Davidson
  - GPX
  - Vespa
- Add a multi-select brand dropdown filter at the top of the customer listing page.
- Default customer listing behavior loads all unsold bikes from all brands.
- Filter customer listings by one or more selected brands.
- Use a brand dropdown in the admin create listing form.
- Use a brand dropdown in the admin edit listing form.
- Validate create and update requests so `brand` can only be empty/null or one of the enum values.
- Keep sold bikes hidden from the customer listing page.

Out of scope:

- Search by model, year, or price.
- Creating a separate bike category table.
- Admin management for editing the allowed brand list.
- Changing listing card layout beyond what is needed for the dropdown.

## Acceptance Criteria

- Given a customer first opens the listing page, when no brand is selected, then all unsold listings from all brands are shown.
- Given a customer selects `Honda`, when the list refreshes, then only unsold Honda listings are shown.
- Given a customer selects `Honda` and `Yamaha`, when the list refreshes, then only unsold Honda and Yamaha listings are shown.
- Given a customer clears all selected brands or chooses `All brands`, when the list refreshes, then all unsold listings are shown again.
- Given an admin creates a listing, when they choose a brand, then the listing is saved with that enum value.
- Given an admin edits a listing, when they change the brand, then the updated listing stores the new enum value.
- Given the API receives an unsupported brand value, when creating or updating a listing, then the request is rejected with a validation error.
- Given existing listings have no brand, when the feature is deployed, then they still load and can be edited.

## UX Requirements

- Customer listing page has a multi-select brand dropdown near the top of the page, before the listing grid.
- Dropdown default state is `All brands`.
- Brand options are displayed in the order listed in this spec.
- Filtering should not require a page reload.
- Admin create/edit forms use a dropdown instead of free text for brand.
- If no bikes match a selected brand, show the existing empty-list style/message.

## API Requirements

- Method/path: `GET /api/bikes`
- Request: optional query parameter `brand`
- Response: existing bike listing response shape
- Behavior: if `brand` is omitted or empty, return all unsold bikes; if one or more valid `brand` values are provided, return unsold bikes matching any selected brand.
- Accepted query shape should support repeated query parameters such as `?brand=Honda&brand=Yamaha`. A comma-separated format may also be supported if it fits the existing frontend/API helper patterns.
- Error cases: invalid `brand` query value should return a validation error or an empty result only if validation is not currently applied to query DTOs.

- Method/path: `POST /api/bikes`
- Request: existing multipart form request, with `brand` restricted to the bike brand enum when present.
- Response: existing created listing response shape.
- Error cases: unsupported `brand` value returns validation error.

- Method/path: `PATCH /api/bikes/:id`
- Request: existing multipart form request, with `brand` restricted to the bike brand enum when present.
- Response: existing updated listing response shape.
- Error cases: unsupported `brand` value returns validation error.

## Data Requirements

- Entity: `Bike`
- Field: `brand`
- Add a backend TypeScript enum for bike brands.
- Preserve existing nullable brand behavior so older listings without a brand remain valid.
- If the database schema changes, add a TypeORM migration instead of using schema synchronization.
- Frontend should use the same brand values and display labels as the backend enum.

## Security And Permissions

- Customer brand filtering is public.
- Admin create and edit actions remain protected by existing admin authentication.
- Do not expose sold listings through the public filtered listing endpoint.

## Test Plan

Backend:

- Unit tests: validate accepted and rejected brand values for create/update.
- Unit tests: verify public listing query filters by one brand and still excludes sold listings.
- Unit tests: verify public listing query filters by multiple brands and still excludes sold listings.
- Unit tests: verify no brand filter returns all unsold listings.
- Build: run `npm run build`.
- Test: run `npm test`.
- Migration: run migration command if the entity/database schema changes.

Frontend:

- Build: run frontend build.
- Manual checks:
  - Customer page starts with `All brands` and shows all unsold bikes.
  - Selecting one brand filters listings.
  - Selecting multiple brands filters listings to any selected brand.
  - Clearing selected brands shows all unsold bikes again.
  - Admin create form saves the selected brand.
  - Admin edit form updates the selected brand.

## Docker And Runtime

- Docker startup should continue to run migrations before backend startup.
- `docker compose up --build` should still start backend, frontend, and Postgres.

## Open Questions

- Should the selected brands be reflected in the URL query string so customers can share filtered links?
