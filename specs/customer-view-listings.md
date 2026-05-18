# Customer View Listings

Status: validated
Created: 2026-05-17 16:55

## Goal

Create a customer-facing page where buyers can view motorbike listings only. The page should make store contact details easy to find, especially the phone number and store address.

This page is separate from the admin listing management view.

## UI Reference

Reference site: https://thimotothuduc.vn/

Use it as inspiration, not as a direct copy. Relevant cues:

- Contact-first header with phone number and address.
- Clear motorbike shop identity in the header.
- Listing-focused page with product cards.
- Dense, easy-to-scan inventory layout.
- Prominent price display on each listing.
- Vietnamese local bike-store feel.

## Users

- Primary user: customer browsing bikes for sale.
- Secondary user: store owner who wants customers to call or visit the store.

## User Stories

- As a customer, I want to see all available motorbike listings, so that I can decide which bike interests me.
- As a customer, I want to see the store phone number, so that I can quickly call about a bike.
- As a customer, I want to see the store address, so that I can visit the shop.
- As the store owner, I want a public listings page separate from admin controls, so that customers do not see listing management tools.

## Scope

In scope:

- Add a customer-facing listings page.
- Show the page header with store name/identity.
- Show phone number: `0907585397`.
- Show bike store address: `Lien Phuong, Thu Duc city`.
- Show bike listings fetched from the existing backend API.
- Hide admin create/edit controls from the customer page.
- Provide loading and empty states for listings.
- Keep the page responsive for mobile and desktop.

Out of scope:

- Admin authentication.
- Bike detail page.
- Search and filters.
- Shopping cart.
- Checkout.
- Customer account login.
- Online payment.
- Google Maps embed.

## Acceptance Criteria

- Given a customer opens the new customer listings page, when the page loads, then they see a header with the store identity, phone number `0907585397`, and address `Lien Phuong, Thu Duc city`.
- Given bike listings exist, when the customer page loads, then it displays the listings in a customer-friendly grid/list without admin form controls.
- Given no bike listings exist, when the customer page loads, then it displays a clear empty state.
- Given the backend API request is loading, when the customer page is waiting for listings, then it displays a loading state.
- Given the backend API request fails, when the customer page cannot load listings, then it displays a user-friendly error state.
- Given the page is viewed on mobile, when the customer scrolls the page, then the header, contact information, and listing cards remain readable without horizontal scrolling.

## UX Requirements

- The customer page should feel like a motorbike showroom/listing page, not an admin dashboard.
- Header must make contact details immediately visible.
- Phone number should be clickable with `tel:0907585397`.
- Address should be visible as text.
- Listing cards should show:
  - Bike image
  - Title
  - Price
  - Brand/model/year when available
  - Mileage when available
  - Description when available
- Do not show the admin add-listing form on this page.
- Use the reference site for layout inspiration: practical header, inventory section, and prominent prices.
- Avoid copying exact branding, text, images, or proprietary layout from the reference site.

## API Requirements

- Reuse existing endpoint: `GET /api/bikes`.
- No new backend endpoint is required for this feature unless implementation discovers a real need.
- The frontend should reuse the existing typed API function if possible.

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
  - `createdAt`
  - `updatedAt`
- No database schema change is expected.

## Security And Permissions

- Customer page is public.
- Customer page must not expose admin-only controls.
- Do not add create/update/delete listing actions to this page.

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
  - Customer page loads.
  - Header shows `0907585397`.
  - Header shows `Lien Phuong, Thu Duc city`.
  - Listings render from `GET /api/bikes`.
  - Admin form is not visible on the customer page.
  - Mobile layout has no horizontal scrolling.

## Docker And Runtime

- The page must work in the existing Docker Compose setup.
- Frontend remains available at `http://localhost:5173`.
- Backend remains available at `http://localhost:3000`.

## Open Questions

- Store name decision: use `Motorbike Market Thu Duc`.
- Route decision: customer page is `/`; admin listing management page moves to `/admin`.
- Currency decision: format prices as VND.
