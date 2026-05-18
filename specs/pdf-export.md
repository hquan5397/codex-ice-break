# PDF Export

Status: validated
Created: 2026-05-17 17:29

## Goal

Add a PDF download action to bike listings so a customer can download a PDF containing bike information and store contact information.

## Users

- Primary user: customer browsing bike listings
- Secondary user: store admin/store owner

## User Stories

- As a customer, I want to download a bike listing as a PDF, so that I can save or share the bike details.
- As a customer, I want the PDF to include store phone and address, so that I can contact or visit the shop later.
- As the store owner, I want every exported PDF to include store information, so that customers know how to reach the store.

## Scope

In scope:

- Add a PDF export/download button to each customer-facing bike listing.
- Generate one PDF per selected bike.
- Include bike information in the PDF.
- Include store information in the PDF.
- Trigger a browser download when the user presses the button.
- Keep admin upload/listing management behavior unchanged unless needed for shared components.

Out of scope:

- Bulk export of all listings.
- PDF export from the backend.
- Emailing PDFs.
- Printing workflow.
- Custom PDF templates in the admin UI.
- Multi-language PDF generation.

## Acceptance Criteria

- Given bike listings are visible on the customer page, when a customer clicks the PDF download button on a listing, then a PDF file downloads.
- Given a PDF is generated, when the customer opens it, then it includes the selected bike title, price, image if practical, brand/model/year when available, mileage when available, and description when available.
- Given a PDF is generated, when the customer opens it, then it includes store name `Motorbike Market Thu Duc`.
- Given a PDF is generated, when the customer opens it, then it includes phone number `0907585397`.
- Given a PDF is generated, when the customer opens it, then it includes address `Lien Phuong, Thu Duc city`.
- Given optional bike fields are missing, when a PDF is generated, then it still downloads successfully and omits or labels missing fields cleanly.
- Given the customer page is viewed on mobile, when the PDF button is shown, then it remains readable and does not break the listing card layout.
- Given the admin page is viewed, when listings are shown there, then PDF export is not required unless reused cleanly.

## UX Requirements

- Add a clear PDF/download action to each customer listing card.
- Prefer an icon plus short label such as `PDF`.
- The action should not hide or replace the existing phone/contact path.
- Button must be accessible by keyboard.
- Download filename should be readable and based on the bike title, for example:

```text
yamaha-r3-abs-v2.pdf
```

## PDF Content Requirements

Store section:

- Store name: `Motorbike Market Thu Duc`
- Phone: `0907585397`
- Address: `Lien Phuong, Thu Duc city`

Bike section:

- Title
- Price
- Brand when available
- Model when available
- Year when available
- Mileage when available
- Description when available
- Bike image when practical from the existing `imageUrl`

Footer:

- Generated date
- Short note such as `Please call the store to confirm availability and latest price.`

## API Requirements

- No backend API change is expected for the first implementation.
- PDF generation can happen in the frontend using existing bike data from `GET /api/bikes`.
- If image embedding from remote URLs causes browser/CORS issues, the first implementation may generate the PDF without embedding the image and should still include all text details.

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

- PDF export is public because customer listings are public.
- PDF generation must not expose admin tokens or admin-only data.
- Do not include hidden/internal fields in the PDF.

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
  - Customer listing cards show a PDF download button.
  - Clicking the PDF button downloads a `.pdf` file.
  - Downloaded PDF includes bike information.
  - Downloaded PDF includes store name, phone, and address.
  - Missing optional bike fields do not break export.
  - Customer page layout remains usable on mobile.

## Docker And Runtime

- The feature must work in the existing Docker Compose setup.
- Frontend remains available at `http://localhost:5173`.
- Backend remains available at `http://localhost:3000`.

## Open Questions

- Image decision: fetch and embed the listing image when browser/CORS behavior allows it; still generate the PDF if image embedding fails.
- Language decision: use English labels for the first implementation.
- Currency decision: use ASCII `VND` text in the PDF instead of the `₫` glyph to avoid built-in PDF font rendering issues.
