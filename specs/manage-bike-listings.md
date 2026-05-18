# Manage Bike Listings

Status: implemented
Created: 2026-05-17 16:49

## Goal

Allow an admin to create motorbike listings with an image and price, then show those listings on the frontend.

## Users

- Primary user: store admin
- Secondary users: buyers browsing listed motorbikes

## User Stories

- As an admin, I want to upload a bike image and listing details, so that buyers can see bikes for sale.
- As a buyer, I want to view available bike listings, so that I can compare motorbikes.

## Scope

In scope:

- Create bike listings from the frontend.
- Upload one image per bike.
- Store listing data in PostgreSQL.
- Serve uploaded images through the backend.
- Display listings in the frontend.
- Run the stack with Docker Compose.

Out of scope:

- Admin authentication.
- Editing or deleting listings.
- Multiple images per bike.
- Buyer contact or checkout flow.
- Production-grade object storage.

## Acceptance Criteria

- Given the admin enters required listing fields and selects a valid image, when they publish the listing, then the backend stores the listing and image path.
- Given listings exist, when the frontend loads, then it displays the newest listings first.
- Given no listings exist, when the frontend loads, then it displays an empty state.
- Given an unsupported image type is uploaded, when the backend receives the request, then it rejects the upload.
- Given the Docker stack starts, when the user opens `http://localhost:5173`, then the frontend is available and can call the backend.

## UX Requirements

- The first screen is the usable admin/listing interface.
- The listing form includes title, price, brand, model, year, mileage, description, and image.
- The selected image shows a preview before publishing.
- Listing cards show image, title, price, key details, and description.
- Loading, success, error, and empty states are visible.

## API Requirements

- `GET /api/bikes`
  - Returns all bike listings.
  - Newest listings first.
- `GET /api/bikes/:id`
  - Returns one listing by id.
  - Returns `404` when the listing does not exist.
- `POST /api/bikes`
  - Request type: `multipart/form-data`.
  - Required fields: `title`, `price`, `image`.
  - Optional fields: `brand`, `model`, `year`, `mileage`, `description`.
  - Image field name: `image`.
  - Accepted image types: JPEG, PNG, WebP.
  - Max image size: 5 MB.

## Data Requirements

- Entity: `Bike`
- Fields:
  - `id`
  - `title`
  - `price`
  - `brand`
  - `model`
  - `year`
  - `mileage`
  - `description`
  - `imageUrl`
  - `createdAt`
  - `updatedAt`
- Store price in a decimal-safe database column.

## Security And Permissions

- Current version has no admin authentication.
- CORS should allow the configured frontend origin.
- Uploaded file type and size must be validated.

## Test Plan

Backend:

- Run `npm run build`.
- Run `npm test` after backend feature changes.
- Run `npm audit --omit=dev` after dependency changes.

Frontend:

- Run `npm run build`.
- Run `npm audit --omit=dev` after dependency changes.
- Manually check listing load and form submission.

## Docker And Runtime

- `docker compose up --build` starts Postgres, backend, and frontend.
- Frontend runs on host port `5173`.
- Backend runs on host port `3000`.
- Postgres runs on host port `5432`.
- Uploaded images are persisted in the `uploaded_images` Docker volume.

## Open Questions

- Should prices be shown in USD, VND, or configurable currency?
- Should admin authentication be added before more listing management features?
- Should images move to object storage for production?
