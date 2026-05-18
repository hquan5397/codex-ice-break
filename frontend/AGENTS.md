# Frontend Agent Rules

This frontend is a React app for browsing and adding motorbike listings.

## Spec-Driven Design

- This project uses spec-driven design.
- Before implementing a frontend feature, read the relevant spec in `../specs/`.
- If no spec exists, create one from `../specs/template.md` or ask the user for enough detail to write it.
- Do not implement broad feature changes from a `draft` spec unless the user explicitly asks for a prototype.
- Keep UI behavior, API calls, validation, and manual checks aligned with the spec.
- If requirements change while coding, update the spec in the same change.

## Multi-Agent Workflow

- For future implementations that touch both backend and frontend, use parallel agents to inspect backend and frontend before coding.
- Keep the frontend inspection focused on UI behavior, typed API calls, state flow, styling, and build impact.
- Coordinate with the backend findings before making cross-stack changes.

## Stack

- React
- TypeScript
- Vite
- CSS modules or plain CSS are acceptable for this small app
- Docker-compatible production build served by Nginx

## Conventions

- Keep frontend source code inside `src/`.
- Use typed API functions in `src/api.ts` for backend communication.
- Keep React components accessible, responsive, and easy to scan.
- Prefer simple state with React hooks until the app grows enough to justify a shared state library.
- Use environment variables for API URLs. Do not hardcode production-only backend URLs in components.
- Use `VITE_API_URL` for the API base URL.

## UI Rules

- The first screen should be the usable admin/listing experience, not a marketing landing page.
- Keep controls compact and practical for inventory management.
- Use icons for tool-like actions when a clear icon exists.
- Keep text readable on mobile and desktop.
- Avoid nested cards and overly decorative dashboard layouts.

## API Rules

- Fetch listings from `GET /api/bikes`.
- Create listings with `POST /api/bikes` using `multipart/form-data`.
- The image field name must be `image`.
- Keep frontend validation aligned with backend validation where practical.

## Verification

Before considering frontend changes complete, run:

```bash
npm run build
```

When dependencies change, also run:

```bash
npm audit --omit=dev
```

## Docker

- Keep the production container serving the built app on port `80`.
- Keep the Compose host port as `5173` unless the root Docker setup changes.
- Use lockfile-based installs in Docker builds.
