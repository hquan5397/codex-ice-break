# Images Preview Implementation Plan

## Summary

Implement the customer-facing image preview feature from `specs/images-preview.md`. The work will enhance the existing listing detail gallery in `frontend/src/App.tsx` with a larger modal-style viewer, keyboard navigation, accessible controls, responsive styling, and stable image fallback behavior.

The feature is expected to be frontend-only. It will reuse the existing `GET /api/bikes/:id` response, `imageUrls` ordering, and `imageUrl` fallback behavior.

## Proposed Changes

### Spec Status

- Update `specs/images-preview.md` from `draft` to `in-progress` during implementation.
- After verification, mark it `implemented`.
- Update `specs/README.md` status for `Images Preview`.
- Update `features-to-be-implemented.MD` after implementation to mark `Customer image gallery improvements with larger preview/fullscreen viewing` as `implemented`.

### Frontend Behavior

- Extend `BikeDetailPage` in `frontend/src/App.tsx`.
- Keep the current selected-image state for the detail page gallery.
- Add viewer state:
  - whether the preview viewer is open
  - the active image index
  - a reference to the element that opened the viewer for focus restoration
- Make the main detail image open the viewer.
- Make thumbnail clicks select the image; if useful for customer flow, allow thumbnails to open the viewer from the selected image.
- Add previous and next controls inside the viewer when more than one image exists.
- Hide or disable previous/next controls for single-image listings.
- Add close behavior through:
  - close icon button
  - Escape key
  - backdrop click
- Add keyboard image navigation:
  - left arrow for previous image
  - right arrow for next image
- Preserve customer listing cards so they continue to use only the primary image and the existing `View details` path.

### Accessibility

- Use a dialog-style modal with `role="dialog"` and `aria-modal="true"`.
- Add accessible labels for preview, close, previous, and next controls.
- Keep focus inside the viewer while open.
- Restore focus to the image or thumbnail that opened the viewer after close.
- Prevent page scrolling while the viewer is open.
- Ensure controls remain keyboard reachable and visible against the image backdrop.

### Styling

- Add focused CSS in `frontend/src/styles.css` for:
  - clickable main detail image affordance
  - fullscreen/modal overlay
  - preview image sizing with `max-width` and `max-height`
  - close, previous, and next icon buttons
  - optional image count indicator
  - mobile-safe layout and spacing
- Keep the detail page layout consistent with the existing customer page style.
- Avoid nested card styling and keep controls compact.

### Broken Image Handling

- Add a small fallback state for failed preview/detail images.
- Avoid layout collapse when an image URL fails to load.
- Keep navigation usable even if one image fails.

### Backend

- No backend endpoint, DTO, service, entity, migration, or Docker changes are expected.
- If implementation discovers a backend mismatch in `imageUrls` or `imageUrl`, pause and update the spec/plan before backend changes.

### README

- No README update is expected unless the implementation changes user-facing routes, setup, commands, APIs, Docker behavior, or runtime configuration.

## Review Step

- Before or during implementation, perform a focused review pass on:
  - detail gallery state flow
  - keyboard and focus behavior
  - mobile styling
  - typed API/data assumptions
  - build impact
- Fold findings into the final patch before verification.

## Test Plan

Frontend:

- Run:

```bash
cd frontend
npm run build
```

- Manual checks:
  - Listing detail page displays the selected image and thumbnails.
  - Clicking the main image opens the larger preview.
  - Viewer opens on the correct active image.
  - Previous and next controls work for multiple images.
  - Single-image listings do not show misleading navigation controls.
  - Escape closes the viewer.
  - Close button closes the viewer.
  - Backdrop click closes the viewer.
  - Left and right arrow keys navigate images while open.
  - Focus returns after close.
  - Mobile layout has no horizontal scrolling.
  - Broken image URLs show a stable fallback state.

Backend:

- No backend verification is expected.
- If backend files change, run:

```bash
cd backend
npm run build
npm test
```

## Risks And Mitigations

- Risk: focus handling becomes fragile in the single-file `App.tsx`.
  - Mitigation: keep viewer helper functions small and local to `BikeDetailPage`.
- Risk: the overlay traps scroll or focus after closing.
  - Mitigation: use cleanup in React effects for body scroll and event listeners.
- Risk: large images overflow on mobile.
  - Mitigation: constrain preview media with viewport-relative max dimensions and test responsive CSS.
- Risk: duplicate image URLs produce unstable thumbnail keys.
  - Mitigation: use image URL plus index for repeated gallery keys where needed.

## Open Decisions

- Use a modal-style fullscreen overlay rather than the browser Fullscreen API for predictable mobile and desktop behavior.
- Keep thumbnails on the detail page; inside the viewer, use previous/next controls and an image count indicator for the first implementation.
- Defer swipe gestures unless you want them included in this first pass.
