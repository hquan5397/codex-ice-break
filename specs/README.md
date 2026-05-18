# Spec-Driven Design

This project uses spec-driven design for product and engineering changes.

Before implementing a feature, create or update a spec in this folder. The spec is the source of truth for behavior, API contracts, UI expectations, data changes, and verification.

## Workflow

1. Create a spec from `template.md`.
2. Fill in user story, scope, acceptance criteria, API/UI/data requirements, and test plan.
3. Review open questions before coding.
4. Implement only what the spec describes.
5. Update the spec if requirements change during implementation.
6. Run the verification checklist from the spec before marking the feature done.

## Naming

Use lowercase kebab-case:

```text
specs/add-admin-login.md
specs/manage-bike-listings.md
specs/search-and-filter-bikes.md
```

Keep filenames stable after a spec is created. Use the `Created:` metadata field and the index below for chronological ordering.

## Spec Index

Feature specs are ordered by creation date.

| Order | Created | Spec | Status |
| --- | --- | --- | --- |
| 1 | 2026-05-17 16:49 | [Manage Bike Listings](manage-bike-listings.md) | implemented |
| 2 | 2026-05-17 16:55 | [Customer View Listings](customer-view-listings.md) | validated |
| 3 | 2026-05-17 17:12 | [Admin Login](admin-login.md) | validated |
| 4 | 2026-05-17 17:29 | [PDF Export](pdf-export.md) | validated |
| 5 | 2026-05-17 18:29 | [Mark Sold](mark-sold.md) | validated |
| 6 | 2026-05-17 18:41 | [Listing Detail](listing-detail.md) | validated |
| 7 | 2026-05-17 18:56 | [Edit Listing](edit-listing.md) | implemented |
| 8 | 2026-05-17 19:40 | [Multi Image Upload](multi-image-upload.md) | implemented |
| 9 | 2026-05-18 09:34 | [Customer Listing Button Position Adjust](customer-listing-button-position-adjust.md) | implemented |
| 10 | 2026-05-18 11:36 | [Backend CQRS Apply](backend-cqrs-apply.md) | implemented |
| 11 | 2026-05-18 12:16 | [Refactor TypeORM](refactor-typeorm.md) | implemented |

## Spec Status

Use one of:

- `draft`
- `ready`
- `in-progress`
- `implemented`
- `validated`

Do not implement from a `draft` spec unless the user explicitly asks for a quick prototype.
