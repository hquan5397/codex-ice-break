---
name: frontend-pdf-export
description: Add or fix browser-side PDF download/export features in frontend apps, especially React/Vite listing pages using jsPDF. Use when Codex needs to create downloadable PDFs from UI data, include store or listing details, embed fetched images, avoid PDF font glyph issues such as broken currency symbols, or troubleshoot generated PDF content.
---

# Frontend PDF Export

Use this skill to add reliable client-side PDF downloads to a web app.

## Workflow

1. Read the relevant feature spec first when the repo uses spec-driven design.
2. Prefer frontend generation when the PDF uses data already loaded in the page and does not require server-only data.
3. Use `jspdf` for lightweight browser-side PDFs.
4. Lazy-load PDF code with `await import('jspdf')` so the main app bundle does not grow unnecessarily.
5. Add the download action only where the user expects it, usually on the public-facing listing card or detail page.
6. Build and audit the frontend after adding dependencies.

## Implementation Pattern

Create a dedicated helper such as `src/pdf.ts` rather than putting PDF generation inside a component.

Recommended shape:

```ts
export async function downloadItemPdf(item: Item, store: StoreInfo) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  // Write store section, item section, footer, then save.
  pdf.save(`${slugify(item.title)}.pdf`);
}
```

Keep components responsible for triggering the action:

```tsx
<button type="button" onClick={() => void downloadItemPdf(item, store)}>
  PDF
</button>
```

## PDF Text Rules

- Use built-in fonts such as `helvetica` unless the project already bundles a font.
- Avoid special currency glyphs with built-in PDF fonts. Prefer ASCII forms such as `2.000 VND` instead of symbol-based prices.
- Keep optional fields conditional so missing data does not produce empty labels.
- Include a generated date and a short availability or contact note when exporting listings.
- Use readable filenames based on the item title, normalized with a slug helper.

## Image Embedding Rules

When embedding images from URLs:

1. Fetch the image URL.
2. Convert the response blob to a data URL with `FileReader`.
3. Load the data URL into an `Image`.
4. Draw it to a canvas.
5. Export the canvas as JPEG with `canvas.toDataURL('image/jpeg', 0.88)`.
6. Add the resulting JPEG to jsPDF with `pdf.addImage`.

This avoids WebP or transparency issues in PDF output.

Always generate the PDF even if image embedding fails. Add a clean fallback line such as `Image could not be embedded in this PDF.`

## Layout Rules

- Use constants for page margin and line height.
- Add an `ensureSpace` helper that creates a new page before text or images overflow.
- Use `pdf.splitTextToSize` for descriptions and other long text.
- Use a fixed image box such as `174 x 98` on A4 portrait pages to keep layout stable.

## Verification

Run the frontend checks after implementation:

```bash
npm run build
npm audit --omit=dev
```

For Dockerized apps, rebuild the frontend service and smoke-check the page:

```bash
docker compose up --build -d frontend
```

Manual checks:

- PDF button is visible where expected.
- Downloaded PDF opens.
- Text is readable and does not show garbled currency symbols.
- Image appears when the image URL is reachable and CORS allows fetch.
- Missing optional fields do not break export.
