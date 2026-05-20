# Pinned Listings Implementation Plan

## Summary

Implement the `pinned-listings` spec so admins can mark listings as pinned, and customers see pinned selling bikes first while keeping current search, brand filtering, detail, and PDF behavior intact.

## Proposed Changes

### Backend

- Add `pinned: boolean` to the `Bike` entity with default `false`.
- Add a TypeORM migration that adds the non-null `pinned` column with a safe default for existing listings.
- Extend create/update DTOs and CQRS command/query flow so pinned status can be saved and returned.
- Update public listing query sorting:
  - `sold = false`
  - optional brand filter
  - optional search filter
  - `pinned DESC`
  - `createdAt DESC`
- Keep sold pinned bikes hidden from public customer listings.
- Preserve existing admin auth requirements for create/update operations.

### Frontend

- Extend the shared bike type/API mapping to include `pinned`.
- Add an admin pin/unpin control on listing cards or admin listing actions.
- Preserve pinned status during edit flows unless the admin changes it.
- Show a compact `Featured` or `Pinned` indicator on customer listing cards.
- Ensure pinned cards still keep fixed bottom action buttons for `View details` and `PDF`.
- Keep search and brand filters working with pinned-first ordering.

### Specs And Docs

- Move `specs/pinned-listings.md` from `draft` to `implemented` after implementation and verification.
- Update `specs/README.md` status for `Pinned Listings`.
- Update `features-to-be-implemented.MD` to mark `Featured or pinned listings` as `implemented`.
- Update root `README.md` if user-facing behavior, API fields, or setup notes change.

## Review Agent Step

- Spawn one review agent before implementation completion to inspect backend and frontend changes together.
- Fold any actionable findings into the final patch before verification.

## Test Plan

Backend:

- Add/update unit tests for:
  - `pinned` defaults to false when omitted.
  - admin create/update can set pinned status.
  - public listings return pinned unsold bikes before unpinned bikes.
  - pinned ordering works with search and multi-brand filters.
  - sold pinned bikes are excluded from customer listings.
- Run:
  - `cd backend && npm run build`
  - `cd backend && npm test`

Frontend:

- Run:
  - `cd frontend && npm run build`
- Manual checks:
  - admin can pin/unpin a listing.
  - pinned state survives reload.
  - customer page shows pinned listings first.
  - pinned indicator is visible and responsive.
  - sold pinned listings do not appear publicly.

Docker:

- If Docker is running, run `docker compose up --build -d` and confirm migrations apply.

## Risks And Mitigations

- Risk: existing listings may fail on migration if the new column has no default.
  - Mitigation: migration adds `pinned` as non-null with default `false`.
- Risk: pinned ordering could break current search/category behavior.
  - Mitigation: apply pinned sorting after filters and cover combined filters with backend tests.
- Risk: admin edit flow may accidentally reset pinned status.
  - Mitigation: include pinned in form state/API payload and test preservation behavior.

## Open Decisions

- Use customer label text `Featured` unless you prefer `Pinned`.
- Allow admins to pin sold listings in admin data, but keep sold listings hidden from customers.
- No maximum pinned count in the first version.
