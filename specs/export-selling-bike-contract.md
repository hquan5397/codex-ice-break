# Export Selling Bike Contract

Status: implemented
Created: 2026-08-01 06:38

## Goal

Allow the admin to generate a formal vehicle sale contract for a specific bike listing, preview it in-app, and export it as a PDF file. The contract captures buyer details entered by the admin and bike details from the listing, producing a printable/shareable document.

## Users

- Primary user: store admin
- Secondary users: store owner, buyer (receives the printed/emailed PDF)

## User Stories

- As an admin, I want to open a contract preview for a specific bike, so that I can fill in buyer details and produce a sale document.
- As an admin, I want to see all bike details pre-filled in the contract, so that I do not have to re-enter information.
- As an admin, I want to export the filled contract as a PDF, so that I can print it or send it to the buyer.
- As an admin, I want a clear preview of the contract before exporting, so that I can verify the content looks correct.

## Scope

In scope:

- Add an "Export contract" button to each bike card in the admin listing page.
- Open a contract sub-page (full-screen overlay or dedicated route) with a contract preview.
- Contract preview is filled with bike data from the listing.
- Admin can enter buyer details in a form on the sub-page (name, phone, ID/passport number, address).
- Admin clicks "Export PDF" to download the contract as a PDF.
- Contract PDF includes store info, bike info, buyer info, sale price, and a signature section.
- Only available to authenticated admins.

Out of scope:

- Saving contract data to the database.
- Emailing the contract.
- Sending the contract to a buyer portal.
- Contract templates management.
- Multi-language contracts.
- Generating contracts for sold bikes via a separate archive view.
- Digital signatures.

## Acceptance Criteria

- Given an admin views the bike listing in the admin page, when they look at a bike card, then an "Export contract" button is visible.
- Given an admin clicks "Export contract" on a bike, when the sub-page opens, then the contract preview is shown with that bike's title, price, brand, model, year, mileage, and description pre-filled.
- Given the contract sub-page is open, when the admin enters buyer details and clicks "Export PDF", then a PDF file downloads named after the bike title, e.g. `contract-yamaha-r3.pdf`.
- Given the PDF is opened, when the admin reviews it, then it contains store info, bike details, buyer details, sale price, date, and a signature block.
- Given the buyer fields are left empty, when the admin exports the PDF, then the contract still downloads and shows blank/placeholder lines for those fields.
- Given the admin closes the sub-page without exporting, when they return to the admin listing, then the bike listing is unchanged.
- Given an unauthenticated user navigates directly to the contract sub-page URL, when the app checks auth, then they are redirected to the login page.

## UX Requirements

- "Export contract" button lives in the `admin-card-actions` row alongside Edit, Mark sold, and Pin.
- Use a `FileText` icon (Lucide) with the label `Contract`.
- The sub-page renders as a full-page overlay or a separate `/admin/bikes/:id/contract` route; prefer an overlay to avoid navigation complexity.
- The overlay has two panels:
  - Left panel (or top on mobile): a form for buyer details (name, phone, ID number, address).
  - Right panel (or bottom on mobile): a styled HTML contract preview that updates live as the admin fills in the form.
- A sticky action bar at the bottom of the overlay contains:
  - `Export PDF` (primary button with a `Download` icon)
  - `Close` button to dismiss the overlay
- Contract preview should be clean and print-friendly; use a white card on a grey background.
- Overlay must be keyboard-accessible: `Escape` closes it, focus is trapped inside, and focus returns to the trigger button on close.
- On mobile, the form stacks above the preview; both are scrollable.

## Contract Content Requirements

Store section (header):

- Store name: `Motorbike Market Thu Duc`
- Phone: `0907585397`
- Address: `Lien Phuong, Thu Duc city`

Contract title:

- Centered heading: `VEHICLE SALE CONTRACT`
- Sub-heading: `Hop Dong Mua Ban Xe May` (bilingual subtitle)

Date line:

- `Date: ___` — pre-filled with the current date when the overlay opens.

Seller section:

- Label: `SELLER`
- Store name, phone, address (same as header, pre-filled)

Buyer section:

- Label: `BUYER`
- Name (editable)
- Phone (editable)
- ID / Passport number (editable)
- Address (editable)

Vehicle section:

- Label: `VEHICLE DETAILS`
- Title / Description of bike
- Brand, Model, Year (when available)
- Mileage (when available, formatted as `XX,XXX km`)
- Frame number (editable, blank by default)
- Engine number (editable, blank by default)

Transaction section:

- Label: `SALE PRICE`
- Price in VND (pre-filled from listing, formatted as `XX,XXX,XXX VND`)
- Payment method (editable text, default `Cash`)

Terms section:

- Short paragraph: `The seller agrees to transfer full ownership of the above vehicle to the buyer upon receipt of full payment. The buyer accepts the vehicle in its current condition.`

Signature block:

- Two columns: `Seller Signature` and `Buyer Signature`
- Each column shows a name label and a blank line for the signature

Footer:

- `Generated: <date>`
- Store name

## API Requirements

- No new backend API endpoints are required.
- The contract sub-page reads bike data from the already-loaded admin bike list (passed as a prop) or re-fetches from `GET /api/bikes/admin` using the stored admin token.
- PDF generation happens entirely in the frontend using existing `jsPDF` dependency.

## Data Requirements

- Reuse existing `Bike` fields:
  - `title`, `price`, `brand`, `model`, `year`, `mileage`, `description`, `imageUrls`, `imageUrl`
- New frontend-only fields (form state, not persisted):
  - `buyerName`, `buyerPhone`, `buyerId`, `buyerAddress`
  - `frameNumber`, `engineNumber`
  - `paymentMethod` (default: `Cash`)
  - `contractDate` (default: today's date)
- No database schema changes required.

## Security And Permissions

- The contract sub-page is only accessible to authenticated admins.
- Admin token is never written into the PDF.
- No buyer PII is sent to the backend.
- PDF is generated entirely client-side.

## Test Plan

Backend:

- No backend changes are expected; run existing tests to confirm no regression:

```bash
npm test
npm run build
```

Frontend:

```bash
npm run build
```

Manual checks:

- Admin bike list shows the `Contract` button on each card.
- Clicking `Contract` opens the overlay with bike data pre-filled.
- Filling in buyer fields updates the contract preview live.
- Clicking `Export PDF` downloads a `.pdf` file named `contract-<slug>.pdf`.
- Downloaded PDF contains store info, bike info, buyer info, price, and signature block.
- Leaving buyer fields blank does not break the export.
- `Escape` key closes the overlay.
- Closing the overlay returns focus to the trigger button.
- Mobile layout stacks form above preview without layout breakage.

## Docker And Runtime

- No Docker or infrastructure changes are required.
- Feature must work in the existing Docker Compose setup.
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Open Questions

- Frame/engine number decision: fields are editable text inputs with blank defaults; admin fills them from physical inspection of the bike.
- Contract language decision: English headings with a bilingual subtitle for the first implementation.
- Currency decision: use ASCII `VND` text in the PDF to avoid glyph rendering issues (consistent with existing `pdf.ts`).
- Image in contract: omit the bike image from the contract PDF to keep it concise; this differs from the customer PDF which includes images.
- Route vs overlay decision: use an overlay (no route change) to avoid routing complexity and keep the admin listing in the background.
