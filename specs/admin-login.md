# Admin Login

Status: validated
Created: 2026-05-17 17:12

## Goal

Add an admin login flow so only authenticated admins can access the bike upload and listing management page.

The public customer listings page remains accessible to everyone.

## Users

- Primary user: store admin
- Secondary user: customer browsing public listings

## User Stories

- As an admin, I want to log in before managing bike listings, so that only authorized people can upload bike information.
- As an admin, I want the app to remember my logged-in state for a reasonable session period, so that I do not need to log in on every refresh.
- As a customer, I want the public listings page to stay open, so that I can browse bikes without logging in.

## Scope

In scope:

- Add an admin login page.
- Protect the admin upload/listing management route.
- Require authentication for backend create-listing API.
- Keep public listing read APIs open.
- Add logout.
- Store admin credential configuration through environment variables.
- Add backend unit tests for auth behavior and protected upload behavior.
- Add frontend login, authenticated admin route, and unauthenticated redirect behavior.

Out of scope:

- Customer accounts.
- Multiple admin users managed in the UI.
- Password reset.
- Email verification.
- OAuth/social login.
- Role-based permission levels.

## Acceptance Criteria

- Given an unauthenticated user opens `/admin`, when the page loads, then they are redirected to or shown the admin login page.
- Given an admin enters valid credentials, when they submit the login form, then they can access the admin upload/listing page.
- Given an admin enters invalid credentials, when they submit the login form, then they see a clear error and remain unauthenticated.
- Given an authenticated admin opens `/admin`, when the page loads, then they see the upload/listing management page.
- Given an authenticated admin clicks logout, when logout completes, then they can no longer access the admin page without logging in again.
- Given an unauthenticated request calls `POST /api/bikes`, when the backend receives it, then it rejects the request.
- Given an authenticated request calls `POST /api/bikes` with valid listing data and image, when the backend receives it, then it creates the listing.
- Given a customer opens `/`, when the page loads, then they can view listings without logging in.
- Given a customer calls `GET /api/bikes`, when the backend receives it, then it returns listings without authentication.

## UX Requirements

- Admin login page should be simple and work-focused.
- Login form should include username and password.
- Login errors should be visible and understandable.
- Admin page should show a logout action once authenticated.
- Customer page must not show login or admin controls.
- Keep the admin upload form hidden from unauthenticated users.

## API Requirements

Suggested backend endpoints:

- `POST /api/auth/login`
  - Request: `{ "username": string, "password": string }`
  - Response: authenticated session/token data.
  - Error: `401` for invalid credentials.
- `POST /api/auth/logout`
  - Ends the admin session/token on the client or server, depending on implementation.
- `GET /api/auth/me`
  - Returns current admin identity if authenticated.
  - Returns `401` if unauthenticated.
- `POST /api/bikes`
  - Must require admin authentication.
- `GET /api/bikes`
  - Remains public.
- `GET /api/bikes/:id`
  - Remains public.

## Data Requirements

- No database schema change is required for the first implementation if using a single configured admin account.
- Admin credentials should come from environment variables:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- Passwords must not be hardcoded in source files.

## Security And Permissions

- Do not store plain-text credentials in frontend code.
- Do not commit real production credentials.
- Prefer HTTP-only cookie sessions or short-lived JWT tokens for authentication.
- If using JWT:
  - Store the signing secret in `JWT_SECRET`.
  - Require token validation on protected backend endpoints.
- If using cookies:
  - Use HTTP-only cookies.
  - Configure CORS credentials carefully.
- Always protect `POST /api/bikes` on the backend, not only in the frontend.
- Public customer listing reads must remain unauthenticated.

## Test Plan

Backend:

- Unit tests for valid login.
- Unit tests for invalid login.
- Unit tests for auth guard behavior.
- Unit tests or controller tests proving `POST /api/bikes` requires authentication.
- Run:

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
  - `/` remains public.
  - `/admin` requires login.
  - Valid login opens admin upload page.
  - Invalid login shows an error.
  - Logout blocks admin access again.
  - Upload works after login.

## Docker And Runtime

- Docker Compose must provide admin auth environment variables to the backend.
- Example development values may be used in `docker-compose.yml`, but production credentials should be overridden outside source control.
- Existing ports stay the same:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:3000`

## Open Questions

- Local development username decision: `admin`.
- Local development password decision: `admin123`.
- Auth strategy decision: JWT bearer tokens stored by the frontend for this first implementation.
- Session duration decision: 8 hours.
