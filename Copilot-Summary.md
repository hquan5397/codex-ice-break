# Copilot Repository Summary: codex-ice-break

## Overview
This repository is a full-stack motorbike listing project, featuring a React frontend and a NestJS (TypeScript) backend, with PostgreSQL as the database. The design philosophy follows a spec-driven approach, where feature specs drive implementation and verification. It is containerized with Docker Compose for easy local development.

## Tech Stack
- **Backend:** NestJS, TypeScript, TypeORM, PostgreSQL
- **Frontend:** React, Vite
- **DevOps:** Docker Compose (services for backend, frontend, and database)

## Key Features
- Motorbike listing CRUD operations with media uploads
- Spec-driven development: every feature/behavior begins with a spec in `specs/`
- Admin dashboard, customer view, PDF export, multi-image upload, advanced search, and CQRS patterns implemented
- Database migrations using TypeORM; automatic schema sync is disabled for safety

## Project Structure
- `/backend`: NestJS API server, with `src/migrations` for DB migrations
- `/frontend`: React app (Vite powered)
- `/specs`: Source-of-truth specifications for each implemented feature
- `docker-compose.yml`: Start the database, backend, and frontend with one command
- See `README.md` for detailed API, setup, and development guides

## Development & Usage
- Quick start: `docker compose up --build`
- API endpoints: `/api/bikes`, `/api/bikes/:id` (listing CRUD)
- Image uploads, migrations, and environment setup covered in `README.md`

## Notable Practices
- Feature implementation strictly follows specs under `/specs`
- Each spec holds user stories, acceptance criteria, API/data contracts, and test plans
- All DB schema changes require corresponding migrations
- Agents and project guidelines live in `AGENTS.md`

## Contribution Guide
1. Draft/extend a spec in `/specs/` before contributing a feature
2. Keep to the naming and workflow guidelines in `specs/README.md`
3. Run and verify migrations as needed; avoid direct DB schema changes

## Status
- Actively developed, not archived
- Most recent features and validations are documented in `specs/README.md`'s spec index
- See the repository for full technical details: https://github.com/hquan5397/codex-ice-break
