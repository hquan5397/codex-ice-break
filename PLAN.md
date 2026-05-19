# Docker Image Workflow Trigger Plan

## Summary

Update the Docker image workflow so it only runs after a pull request has been merged into `main`.

## Proposed Changes

- Update `.github/workflows/docker-image.yml`:
  - keep `push` on `main`
  - remove the `pull_request` trigger
  - keep Docker Hub login and image push behavior unchanged

## Why This Works

GitHub Actions does not have a direct "after PR merged" trigger for this build style. When a PR is merged into `main`, GitHub creates a push event on `main`, so `on: push` with `branches: ["main"]` is the correct trigger.

## Verification

- No local app build is required because this is workflow trigger configuration only.
- Confirm `.github/workflows/docker-image.yml` has only:
  - `on.push.branches: ["main"]`
- After merge, GitHub should run the Docker image workflow and push backend/frontend images to Docker Hub.
