# Customer Listing Button Position Adjust

Status: implemented
Created: 2026-05-18 09:34

## Goal

Keep the customer listing card actions visually aligned by placing the `View details` and `PDF` buttons at a fixed bottom position inside each listing card.

## Users

- Primary user: buyers browsing bike listings
- Secondary users: store admin reviewing the customer-facing page

## User Stories

- As a buyer, I want listing card buttons to appear in the same position across cards, so that the listing grid is easier to scan.
- As a store admin, I want the customer listing page to look polished, so that the store feels trustworthy.

## Scope

In scope:

- Adjust customer listing card layout so action buttons stay at the bottom of each card.
- Keep `View details` and `PDF` grouped together.
- Preserve responsive behavior on mobile and desktop.
- Ensure cards with longer descriptions do not push buttons into inconsistent positions.

Out of scope:

- Backend API changes.
- Listing data model changes.
- New customer actions.
- Redesigning the full customer page.

## Acceptance Criteria

- Given multiple customer listing cards have different title, metadata, or description lengths, when the customer listing grid is shown, then `View details` and `PDF` buttons align at the bottom of each card.
- Given a listing has no description, when the card is shown, then the action buttons still stay at the bottom.
- Given a listing has a long description, when the card is shown, then the action buttons remain visible and do not overlap content.
- Given the page is viewed on mobile, when listing cards stack vertically, then the action buttons remain at the bottom of each card.
- Given the customer card actions are aligned, when the admin card layout is viewed, then existing admin controls are not broken.

## UX Requirements

- Customer listing cards should use a consistent vertical structure.
- The card content area should stretch so the action row can sit at the bottom.
- The action row should preserve the existing button styling and spacing.
- Text must not overlap buttons.
- The layout should remain clean at desktop and mobile widths.

## API Requirements

- No API changes.

## Data Requirements

- No data model changes.

## Security And Permissions

- No security or permission changes.

## Test Plan

Backend:

- No backend tests required.
- No backend build required unless backend files are changed.

Frontend:

- Run `npm run build`.
- Manually check customer listing cards with short and long descriptions.
- Manually check mobile layout.
- Manually check that admin listing controls still render correctly.

## Docker And Runtime

- The feature should work with `docker compose up --build`.
- No environment variable changes.

## Open Questions

- Should long descriptions be clamped to a fixed number of lines to keep card heights more uniform?
