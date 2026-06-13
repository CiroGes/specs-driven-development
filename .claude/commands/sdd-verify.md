---
description: Run the full validation suite for a feature — npm run test, typecheck, lint, validate:specs, map:specs — and fix any broken traceability links between spec, code, and tests. Use after /sdd-implement or before committing, to confirm the feature is in a green, traceable state.
---

# SDD Verify

## Inputs
- Feature folder in `specs/features/`
- Related code and tests

## Expected Output
- Validation summary for:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run validate:specs`
  - `npm run map:specs`

## Done Criteria
- No failing checks
- Broken traceability links are fixed
