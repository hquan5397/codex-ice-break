# Images Preview

Status: implemented
Created: 2026-05-21 22:07

## Goal

Improve the customer-facing listing image gallery so buyers can inspect motorbike photos in a larger preview and fullscreen viewing experience before contacting the store.

## Users

- Primary user: customer browsing bike listings
- Secondary user: store owner who wants listing photos to help buyers decide faster

## User Stories

- As a customer, I want to open a larger preview of a listing image, so that I can inspect the bike condition more clearly.
- As a customer, I want to browse all images for one listing from the preview, so that I do not have to return to the page between photos.
- As a customer on mobile, I want the image viewer to fit my screen, so that I can inspect photos without awkward scrolling or layout breakage.

## Scope

In scope:

- Add a larger image preview/fullscreen viewer for customer-facing listing detail images.
- Support listings with one or many images.
- Let customers move between images while the viewer is open.
- Make thumbnails or current image selection clear on the listing detail page.
- Support closing the viewer with visible controls, Escape key, and backdrop click where appropriate.
- Keep the viewer responsive on mobile, tablet, and desktop.
- Preserve existing listing card primary image behavior.

Out of scope:

- Admin image upload or ordering changes.
- Backend schema changes.
- Image cropping, editing, zoom/pan, or rotation tools.
- Video gallery support.
- Customer image uploads.
- Replacing the existing upload storage strategy.

## Acceptance Criteria

- Given a customer opens a listing detail page with images, when they select the main image or a thumbnail, then a larger preview/fullscreen viewer opens with that image active.
- Given the viewer is open for a listing with multiple images, when the customer uses next or previous controls, then the active image changes without leaving the viewer.
- Given the viewer is open, when the customer closes it with the close button, Escape key, or supported backdrop click, then focus returns to the listing page without losing the selected image state.
- Given the listing has one image, when the viewer opens, then next and previous controls are hidden or disabled.
- Given a listing has multiple images, when the detail page renders, then the currently selected image and available thumbnails are visually clear.
- Given a customer views the gallery on mobile, when they open and navigate the viewer, then images fit within the viewport without horizontal scrolling.
- Given an image fails to load, when the customer is viewing the listing or preview, then the UI shows a stable fallback state without breaking navigation.
- Given the customer listing card renders, then it continues to use the primary listing image and does not expose fullscreen controls directly on the card.

## UX Requirements

- The listing detail page should show a prominent selected image with compact thumbnails for additional images.
- The larger preview should prioritize the photo, with minimal controls for close, previous, and next.
- Use icon buttons for close and navigation controls when clear icons are available.
- Controls must have accessible labels.
- The viewer should trap focus while open and restore focus after close.
- Keyboard support:
  - Escape closes the viewer.
  - Left arrow moves to the previous image when available.
  - Right arrow moves to the next image when available.
- The viewer should not show admin controls or upload affordances.
- The layout should stay readable and practical, matching the existing customer listing/detail visual style.

## API Requirements

- Reuse existing endpoint:
  - `GET /api/bikes/:id`
- The response should use existing listing image fields:
  - `imageUrl`
  - `imageUrls` when available
- No new backend endpoint is expected.
- No request shape changes are expected.

## Data Requirements

- Reuse existing `Bike` data.
- Use `imageUrls` in saved display order when available.
- Fall back to `imageUrl` for older or single-image listings.
- No database migration is expected.

## Security And Permissions

- The image viewer is public customer-facing UI.
- Do not expose admin-only actions, tokens, or edit controls.
- Uploaded images remain served through the existing `/uploads` path.
- External image handling should not introduce unsafe inline HTML.

## Test Plan

Backend:

- No backend change is expected.
- If backend code changes, run:

```bash
npm run build
npm test
```

Frontend:

- Run:

```bash
npm run build
```

- Manually check:
  - Listing detail page displays the selected image and thumbnails.
  - Clicking the main image opens the larger preview.
  - Clicking a thumbnail opens or selects the matching image.
  - Previous and next controls work for multiple images.
  - Single-image listings do not show misleading navigation controls.
  - Escape, close button, and supported backdrop click close the viewer.
  - Mobile layout has no horizontal scrolling.
  - Broken image URLs show a stable fallback state.

## Docker And Runtime

- The feature must work in the existing Docker Compose setup.
- Existing ports stay the same:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`
- No new environment variables are expected.

## Open Questions

- Should fullscreen viewing be implemented as a modal overlay or by using the browser Fullscreen API?
- Should thumbnails remain visible inside the fullscreen viewer, or should navigation controls be enough?
- Should the larger preview support swipe gestures on touch devices in the first implementation?
