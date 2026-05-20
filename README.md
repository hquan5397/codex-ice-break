# Motorbike Store

Full-stack motorbike listing app with:

- NestJS + TypeScript API
- TypeORM + PostgreSQL
- React + Vite frontend
- Docker Compose for Postgres, backend, and frontend

## Spec-Driven Design

This project uses spec-driven design. Feature behavior and acceptance criteria live in `specs/`.

- Start with `specs/template.md` for new features.
- Keep backend and frontend changes aligned with the relevant spec.
- Current implemented feature spec: `specs/listing-sort-controls.md`.
- Project agent rules live in `AGENTS.md`.

## Run With Docker

```bash
docker compose up --build
```

The backend container runs pending database migrations before it starts the API.

Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/bikes
- Uploaded images: http://localhost:3000/uploads/<filename>

## API

`GET /api/bikes`

Returns all bike listings.

Optional query parameters:

- `brand`: repeatable brand filter, for example `?brand=Honda&brand=Yamaha`
- `search`: search by title, brand, or model
- `sort`: `newest`, `price_asc`, or `price_desc`

`GET /api/bikes/:id`

Returns one bike listing.

`POST /api/bikes`

Creates a listing using `multipart/form-data`.

Fields:

- `title` required
- `price` required
- `image` required, JPEG/PNG/WebP, max 5 MB
- `brand`
- `model`
- `year`
- `mileage`
- `description`
- `pinned`

## Local Development

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

For local backend development, run Postgres yourself or start only the database:

```bash
docker compose up postgres
```

Run migrations against the local Compose database:

```bash
cd backend
npm run migration:run
```

Create a new migration after changing an entity:

```bash
cd backend
npm run migration:generate -- src/migrations/NameOfChange
```

## Notes

TypeORM `synchronize` is disabled by default. Keep schema changes in `backend/src/migrations` and run migrations before relying on new database fields.

## CI/CD

The Docker image workflow runs after changes are merged into `main`. It builds backend and frontend Docker images and pushes them to Docker Hub using the configured repository secrets.
