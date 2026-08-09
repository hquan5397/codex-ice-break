# Backend Workflow Split Plan

## Summary

Split the current combined backend workflow into two workflows:

1. `backend-test` that runs automatically for pull requests targeting `main` (including new commits on the PR).
2. `backend-security-scanning` that is started manually by a human.

## Planned Changes

- Create `.github/workflows/backend-test.yml` with the existing backend build/test job and PR trigger.
- Create `.github/workflows/backend-security-scanning.yml` with the existing backend security job and `workflow_dispatch` trigger.
- Remove `.github/workflows/backend-test-security.yml` after the split.
- Keep Node setup, dependency install, and existing security steps aligned with current behavior.
- Keep report artifact upload and job summary output in the security workflow.

## Verification

- Validate both workflow YAML files parse correctly.
- Confirm triggers are correctly scoped:
  - backend-test: PR events (open/reopen/synchronize)
  - backend-security-scanning: manual trigger only
