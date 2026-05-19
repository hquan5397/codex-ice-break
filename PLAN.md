# Fix GitHub PR Governance Files Plan

## Summary

Fix the GitHub PR governance files so the plan gate workflow and CODEOWNERS rules work with GitHub’s expected paths and syntax.

## Proposed Changes

- Update `.github/workflows/plan-gate.yml`:
  - check for `.github/pull_request_template.md`
  - update the error/success messages to use the same path
- Update `.github/CODEOWNERS`:
  - replace invalid default owner line `- @hquan5397`
  - use `* @hquan5397` as the default owner rule
  - keep existing ownership for security, workflows, and infra paths

## Verification

- No local build/test required because this is GitHub metadata only.
- Confirm files are present:
  - `.github/pull_request_template.md`
  - `.github/workflows/plan-gate.yml`
  - `.github/CODEOWNERS`
- Future PRs should pass the plan gate path check and request the expected owner review.
