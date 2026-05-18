# Multi Image Upload

Status: implemented
Created: 2026-05-17 19:40

## Goal

Allow an authenticated admin to upload and manage multiple images for one motorbike listing, so buyers can inspect the bike from different angles.

## Users

- Primary user: store admin
- Secondary users: buyers browsing listing cards, listing details, and exported PDFs

## User Stories

- As an admin, I want to upload many images for a listing, so that each bike can show front, side, rear, dashboard, and detail photos.
- As an admin, I want to preview selected images before saving, so that I can remove mistakes before publishing.
- As a buyer, I want to view multiple images of a bike, so that I can better understand the bike condition before calling the store.

## Scope

In scope:

- Allow multiple images when creating a listing.
- Allow adding or replacing multiple images when editing a listing.
- Allow drag-and-drop ordering for listing images.
- Store multiple image URLs for each bike listing.
- Keep one primary image for listing cards based on the first image in the ordered list.
- Show all images on the listing detail page.
- Include listing images in PDF export where practical.
- Preserve upload validation and cleanup behavior for all images.

Out of scope:

- Image cropping or editing.
- Cloud object storage.
- Video uploads.
- Buyer-submitted images.

## Acceptance Criteria

- Given an admin creates a listing with multiple valid images, when the listing is saved, then all images are stored and returned by the API.
- Given a listing has multiple images, when the admin views listings, then the primary image is visible and the total image count is clear.
- Given a listing has multiple images, when a buyer opens the detail page, then all listing images are visible in a gallery.
- Given a listing has multiple images, when the customer listing page displays the bike card, then it uses the primary image.
- Given an admin drags images into a new order, when the listing is saved, then the API preserves that order.
- Given an admin changes image order, when the listing card, detail page, and PDF are shown, then the first image in the saved order is used as the primary image.
- Given an admin edits a listing and selects replacement images, when the edit is saved, then the listing images are updated.
- Given an admin edits a listing without selecting new images, when the edit is saved, then existing images are preserved.
- Given one uploaded image has an invalid type or invalid content, when the backend receives the request, then the request is rejected and uploaded files from that request are cleaned up.
- Given no image is selected for a new listing, when the admin submits the form, then the request is rejected.

## UX Requirements

- The admin create/edit form supports selecting multiple JPEG, PNG, or WebP images.
- The image picker shows previews for all selected images.
- The admin can remove a selected image before submitting.
- The admin edit form shows existing images.
- The admin can reorder selected or existing images with drag and drop.
- The image order is visually clear, with the first image marked as primary.
- The admin can still reorder images on touch devices or keyboard-accessible controls if drag and drop is not available.
- The customer listing card uses the primary image.
- The listing detail page shows a gallery with a large selected image and thumbnails or a simple responsive grid.
- Loading, success, validation error, and server error states remain visible.
- The UI remains usable on mobile.

## API Requirements

- `GET /api/bikes`
  - Returns each bike with a primary `imageUrl` and all image URLs.
- `GET /api/bikes/:id`
  - Returns all image URLs for the listing.
- `GET /api/bikes/admin`
  - Returns all image URLs for admin listing management.
- `POST /api/bikes`
  - Protected by admin authentication.
  - Request type: `multipart/form-data`.
  - Image field name: `images`.
  - Accepts multiple image files.
  - Requires at least one image.
  - Accepted image types: JPEG, PNG, WebP.
  - Max size: 5 MB per image.
  - Max count: 8 images per listing.
  - Stores images in the same order sent by the frontend.
- `PATCH /api/bikes/:id`
  - Protected by admin authentication.
  - Request type: `multipart/form-data`.
  - Optional image field name: `images`.
  - If no new images are submitted, preserve existing listing images.
  - If new images are submitted, replace the listing image set unless the implementation adds an explicit append/remove model.
  - Supports updating image order without requiring image re-upload.
  - Accepts ordered existing image URLs or image ids when reordering saved images.

## Data Requirements

- Existing entity: `Bike`
- Add support for multiple image URLs.
- Keep `imageUrl` or an equivalent primary image value for backwards-compatible card rendering.
- Recommended shape:
  - `imageUrls: string[]` in display order
  - `imageUrl: string` as the primary image derived from the first image
- Store image URLs in a database shape TypeORM/Postgres can query and serialize reliably.
- Persist image order exactly as the admin saves it.
- Preserve `createdAt` during image edits and update `updatedAt`.

## Security And Permissions

- Only authenticated admins can create or edit listing images.
- Validate MIME type and image file content for every uploaded image.
- Enforce per-image file size and max image count.
- Clean up uploaded files if validation or persistence fails.
- Do not expose admin image controls on customer-facing pages.

## Test Plan

Backend:

- Add unit tests for creating a listing with multiple images.
- Add unit tests for rejecting create requests with no images.
- Add unit tests for preserving images on edit when no replacement images are submitted.
- Add unit tests for replacing listing images on edit.
- Add unit tests for reordering existing listing images.
- Add unit tests proving `imageUrl` follows the first ordered image.
- Add controller tests for multiple uploaded file URL generation.
- Add tests for invalid image content cleanup across multiple files.
- Run `npm test` after implementation.
- Run `npm run build`.

Frontend:

- Run `npm run build`.
- Manually check creating a listing with multiple images.
- Manually check editing a listing without replacing images.
- Manually check editing a listing with replacement images.
- Manually check drag-and-drop image ordering.
- Manually check primary image changes after reordering.
- Manually check customer listing cards still show a primary image.
- Manually check listing detail gallery on desktop and mobile.
- Manually check PDF export with listings that have multiple images.

## Docker And Runtime

- The feature should work with `docker compose up --build`.
- Uploaded images should persist in the existing uploaded images volume.
- Existing single-image listings should continue to render after the change.

## Open Questions

- Should editing images replace the whole image set or allow adding/removing individual images?
- Should the admin be able to choose which image is primary separately, or is the first image always primary?
- Should PDF export include all images or only the primary image plus a small gallery?
