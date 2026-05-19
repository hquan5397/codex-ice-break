# Consolidate Agent Rules Plan

## Summary

Replace the separate backend and frontend `AGENTS.md` files with one root-level `AGENTS.md` that covers the whole project.

## Proposed Changes

- Create root `AGENTS.md`.
- Merge the important rules from:
  - `backend/AGENTS.md`
  - `frontend/AGENTS.md`
- Keep one shared rule set for:
  - spec-driven design
  - required plan-first workflow
  - one review/inspection agent for feature implementation
  - backend stack, conventions, API, database, verification
  - frontend stack, conventions, UI, API, verification
  - Docker expectations
  - README updates when setup, commands, workflows, APIs, Docker, specs, or user-facing behavior changes
- Delete:
  - `backend/AGENTS.md`
  - `frontend/AGENTS.md`
- Update `README.md` to mention root `AGENTS.md` as the project guidance file.

## Verification

- No build or test required because this is documentation/rules only.
- Confirm only root `AGENTS.md` remains in project source folders.
