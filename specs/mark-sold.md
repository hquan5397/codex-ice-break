# Mark Sold

Status: validated
Created: 2026-05-17 18:29

## Goal

Allow admins to mark a bike listing as `Sold` or `Selling`. Sold bikes should remain manageable in the admin page but should be hidden from the customer-facing listing page.

## Users

- Primary user: store admin
- Secondary user: customer browsing bikes for sale

## User Stories

- As an admin, I want to mark a bike as sold, so that customers no longer see unavailable bikes.
- As an admin, I want to switch a sold bike back to selling, so that I can correct mistakes or relist a bike.
- As a customer, I only want to see bikes that are currently available for sale.

## Scope

In scope:

- Add a `sold` boolean field to the `Bike` entity.
- New bike listings default to `sold: false`.
- Add an admin control to toggle each bike between `Sold` and `Selling`.
- Keep sold bikes visible in the admin listing page.
- Hide sold bikes from the customer listing page.
- Return sold status from backend bike APIs.
- Add backend tests for sold status behavior.

Out of scope:

- Sold date tracking.
- Buyer information.
- Sales reports.
- Automatic archiving.
- Separate sold bikes page for customers.

## Acceptance Criteria

- Given an admin creates a new bike listing, when the listing is saved, then `sold` defaults to `false`.
- Given an admin views `/admin`, when listings load, then both selling and sold bikes are visible.
- Given an admin clicks the status button on a selling bike, when the request succeeds, then the bike becomes `Sold`.
- Given an admin clicks the status button on a sold bike, when the request succeeds, then the bike becomes `Selling`.
- Given a bike is sold, when a customer views `/`, then that bike is not shown.
- Given a bike is selling, when a customer views `/`, then that bike is shown.
- Given an unauthenticated user tries to update sold status, when the backend receives the request, then it returns `401`.
- Given a customer calls the public listings endpoint, when the backend returns data, then sold bikes are excluded.

## UX Requirements

- Admin listing cards should show the current status: `Selling` or `Sold`.
- Admin listing cards should include a clear button to switch status.
- Use concise button labels:
  - `Mark sold` when `sold` is `false`.
  - `Mark selling` when `sold` is `true`.
- Sold listings in admin should be visually distinct but still readable.
- Customer listing cards should not show sold bikes.
- Customer empty state should still work when all bikes are sold.

## API Requirements

Recommended API behavior:

- `GET /api/bikes`
  - Public endpoint.
  - Returns only bikes where `sold = false`.
- `GET /api/bikes/:id`
  - Public endpoint.
  - Should return only selling bikes unless admin-specific detail behavior is added.
- `GET /api/bikes/admin`
  - Protected admin endpoint.
  - Returns all bikes, including sold bikes.
- `PATCH /api/bikes/:id/sold`
  - Protected admin endpoint.
  - Request: `{ "sold": boolean }`
  - Response: updated bike.
  - Returns `404` when the bike does not exist.
  - Returns `401` when unauthenticated.

Alternative acceptable API shape:

- `PATCH /api/bikes/:id` may be used if the project already has update semantics, but this project currently does not, so a focused sold-status endpoint is preferred.

## Data Requirements

- Update `Bike` entity:
  - Add `sold: boolean`
  - Default value: `false`
- No new table is required.
- Existing records should behave as selling bikes after migration/sync.

## Security And Permissions

- Updating sold status is admin-only.
- Public customer listing reads remain unauthenticated.
- Customer-facing endpoints must not rely on frontend filtering alone; sold bikes should be excluded by the backend public API.

## Test Plan

Backend:

- Unit test that new bike creation defaults to `sold: false`.
- Unit test that public listing query excludes sold bikes.
- Unit test that admin listing query includes sold bikes.
- Unit test that sold status can be updated.
- Unit test that missing bike update returns `404`.
- Unit test or controller metadata test proving sold-status updates require admin auth.
- Run:

```bash
npm test
npm run build
```

Frontend:

- Run:

```bash
npm run build
```

- Manually check:
  - Customer page hides sold bikes.
  - Admin page shows sold and selling bikes.
  - Admin status button toggles between `Sold` and `Selling`.
  - All-sold customer inventory shows the empty state.

## Docker And Runtime

- Feature must work in the existing Docker Compose setup.
- Existing ports stay the same:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`

## Open Questions

- Public detail decision: `/api/bikes/:id` hides sold bikes from customers by returning `404`.
- Admin ordering decision: selling bikes appear before sold bikes on the admin page.
