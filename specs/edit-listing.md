# Edit Listing

Status: implemented
Created: 2026-05-17 18:56

## Goal

Allow an authenticated admin to edit existing motorbike listing information after it has been published.

## Users

- Primary user: store admin
- Secondary users: buyers browsing updated motorbike listings

## User Stories

- As an admin, I want to edit a listing's information, so that I can correct mistakes or update details without creating a duplicate listing.
- As a buyer, I want listing information to stay accurate, so that I can trust the price, bike details, and description shown on the site.

## Scope

In scope:

- Add an edit action for each listing on the admin page.
- Let the admin update listing text fields and price.
- Let the admin optionally replace the listing image.
- Persist edited listing information in PostgreSQL.
- Reflect updated listing information on the admin page, customer listing page, listing detail page, and PDF export.
- Require admin authentication for editing.

Out of scope:

- Deleting listings.
- Bulk editing multiple listings.
- Editing store contact information.
- Image gallery or multiple images per listing.
- Full listing revision history.

## Acceptance Criteria

- Given an admin is logged in, when they open the admin page, then each listing has an edit action.
- Given an admin edits a listing and submits valid values, when the backend accepts the request, then the listing is updated without changing its id.
- Given an admin does not choose a new image, when they save edits, then the existing image remains attached to the listing.
- Given an admin chooses a valid new image, when they save edits, then the listing uses the new image.
- Given an unauthenticated user sends an edit request, when the backend receives it, then the backend rejects the request with `401`.
- Given a listing was edited, when buyers view customer listings, listing detail, or export PDF, then they see the updated information.
- Given invalid values are submitted, when the backend validates the request, then it returns a helpful validation error and does not update the listing.

## UX Requirements

- The admin page shows an edit button or icon for each listing.
- Editing can happen in a dedicated form view, modal, or inline panel as long as the current listing values are prefilled.
- The edit form includes title, price, brand, model, year, mileage, description, sold status, and optional image replacement.
- The current image is visible while editing.
- If a new image is selected, show a preview before saving.
- Loading, success, validation error, and server error states are visible.
- The admin can cancel editing without changing the listing.

## API Requirements

- `PATCH /api/bikes/:id`
  - Protected by admin authentication.
  - Request type: `multipart/form-data`.
  - Optional fields: `title`, `price`, `brand`, `model`, `year`, `mileage`, `description`, `sold`, `image`.
  - Image field name: `image`.
  - Accepted image types: JPEG, PNG, WebP.
  - Max image size: 5 MB.
  - Returns the updated bike listing.
  - Returns `401` when the user is not authenticated.
  - Returns `404` when the listing does not exist.
  - Returns `400` when submitted fields are invalid.

## Data Requirements

- Entity: `Bike`
- Reuse existing fields:
  - `title`
  - `price`
  - `brand`
  - `model`
  - `year`
  - `mileage`
  - `description`
  - `imageUrl`
  - `sold`
  - `updatedAt`
- Update `updatedAt` whenever listing data changes.
- Keep `id` and `createdAt` unchanged during edits.
- Preserve the existing `imageUrl` when no replacement image is submitted.

## Security And Permissions

- Only authenticated admins can edit listings.
- Reuse the existing JWT admin guard.
- Validate file type and size for replacement images.
- Validate request fields before writing to the database.
- Do not expose admin edit controls on customer-facing pages.

## Test Plan

Backend:

- Add unit tests for successful listing edits.
- Add unit tests for editing without replacing the image.
- Add unit tests for replacing the image.
- Add unit tests for not-found listing edits.
- Add controller tests for protected edit API behavior.
- Run `npm test` after implementation.
- Run `npm run build`.

Frontend:

- Run `npm run build`.
- Manually check admin edit flow with and without replacing an image.
- Manually check customer listing page after editing.
- Manually check listing detail page after editing.
- Manually check PDF export after editing.

## Docker And Runtime

- The feature should work with `docker compose up --build`.
- Edited listing data should persist in Postgres.
- Replacement images should persist in the existing uploaded images volume.

## Open Questions

- Should old replacement images be deleted from storage after a listing image is changed?
- Should the admin edit screen be a modal, inline panel, or dedicated route?
