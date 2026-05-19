# Backend Test And Security Workflow Plan

## Summary

Add or update a GitHub Actions workflow for pull requests to run build/test only inside the `backend` project, then run CodeQL security analysis.

## Proposed Workflow Changes

- Create a workflow file such as `.github/workflows/backend-test-security.yml`.
- Trigger only on pull requests targeting `main`.
- Test job should:
  - check out the repository
  - set up Node.js
  - run `npm ci` in `backend`
  - run `npm run build` in `backend`
  - run `npm test` in `backend`
- Security analysis job should:
  - keep CodeQL permissions:
    - `contents: read`
    - `security-events: write`
  - initialize CodeQL for JavaScript/TypeScript
  - run CodeQL analyze
- Do not run root-level `npm install`, `npm run build`, or `npm test` because this project has separate `backend` and `frontend` package directories.

## Notes

- Existing Docker image workflow remains unchanged unless you ask to combine workflows.
- Backend test workflow can use `working-directory: backend` for npm commands.
- Prefer `npm ci` over `npm install` in CI for lockfile-based installs.

## Verification

- No local build is required for a workflow YAML-only change.
- After merge/opening a pull request, GitHub Actions should show:
  - backend build passing
  - backend tests passing
  - CodeQL security analysis passing
