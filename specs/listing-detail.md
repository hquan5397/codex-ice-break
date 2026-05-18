# Listing Detail

Status: validated
Created: 2026-05-17 18:41

## Goal

Add a customer-facing detail page for each bike listing so customers can view complete information about one bike before calling or visiting the store.

## Users

- Primary user: customer browsing bikes for sale
- Secondary user: store admin/store owner

## User Stories

- As a customer, I want to open a bike detail page, so that I can inspect one listing more carefully.
- As a customer, I want the detail page to include contact information, so that I can call the store about that bike.
- As a customer, I want sold bikes hidden from public detail pages, so that I do not spend time on unavailable bikes.

## Scope

In scope:

- Add a public listing detail page.
- Add a way to navigate from a customer listing card to its detail page.
- Show all available bike information on the detail page.
- Show store phone number and address on the detail page.
- Keep sold bikes hidden from public detail pages.
- Keep admin page behavior unchanged unless shared components need small updates.
- Reuse existing backend public detail endpoint where possible.

Out of scope:

- Admin detail page.
- Editing from the detail page.
- Related listings.
- Image gallery or multiple images.
- Customer inquiry form.
- SEO metadata management.

## Acceptance Criteria

- Given a customer sees a bike on the customer listing page, when they click the listing or a detail action, then they navigate to a detail page for that bike.
- Given the bike is selling, when the detail page loads, then it displays the bike image, title, price, brand/model/year when available, mileage when available, description when available, and listing date.
- Given the detail page loads, then it displays store name `Motorbike Market Thu Duc`, phone number `0907585397`, and address `Lien Phuong, Thu Duc city`.
- Given the detail page loads, then the phone number is clickable using `tel:0907585397`.
- Given the bike does not exist or is sold, when the customer opens its detail URL, then the page shows a clear not-found/unavailable state.
- Given the customer opens a detail page on mobile, then the layout remains readable without horizontal scrolling.
- Given the customer is on the detail page, then they can navigate back to the customer listings page.

## UX Requirements

- Customer listing cards should expose a clear path to the detail page.
- Recommended route: `/bikes/:id`.
- Detail page should feel like a focused showroom page, not an admin page.
- Use the bike image prominently.
- Keep store contact actions visible near the bike details.
- Include a PDF download action on the detail page if the PDF export helper can be reused cleanly.
- Do not show admin controls on the detail page.

## API Requirements

- Reuse existing endpoint:
  - `GET /api/bikes/:id`
- This endpoint already hides sold bikes by returning `404`.
- No new backend endpoint is expected unless implementation discovers a real need.

## Data Requirements

- Reuse existing `Bike` data:
  - `id`
  - `title`
  - `price`
  - `brand`
  - `model`
  - `year`
  - `mileage`
  - `description`
  - `imageUrl`
  - `sold`
  - `createdAt`
  - `updatedAt`
- No database schema change is expected.

## Security And Permissions

- Detail page is public.
- Sold bikes must remain hidden by backend public API behavior, not only frontend filtering.
- Admin tokens or admin-only controls must not appear on the customer detail page.

## Test Plan

Backend:

- No backend change is expected.
- If backend code changes, run:

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
  - Customer listing page links to detail pages.
  - Detail page loads for selling bikes.
  - Detail page shows store contact information.
  - Detail page shows a not-found/unavailable state for missing or sold bikes.
  - Back navigation returns to listings.
  - Mobile layout has no horizontal scrolling.

## Docker And Runtime

- Feature must work in the existing Docker Compose setup.
- Existing ports stay the same:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`

## Open Questions

- Navigation decision: customer listing cards use a dedicated `View details` link.
- PDF decision: include the existing PDF download action on the detail page.
