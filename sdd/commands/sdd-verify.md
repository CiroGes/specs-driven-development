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
  - `npm run validate:specs -- --strict`
  - `npm run map:specs`
  - `npm run coverage:specs`

## Gates (treat as failures)
- Run `validate:specs` with `--strict` at verify time: unresolved
  `[NEEDS CLARIFICATION]` markers then exit non-zero (script-enforced), so the spec
  must be free of open markers before the feature is done. (Plain `validate:specs`
  only warns, which is intentional for iterative authoring.)
- `coverage:specs` exits non-zero on any uncovered acceptance criterion (an
  `AC<n>` with no referencing task or no verification row). Fix before passing.
  (Orphan-task warnings from `coverage:specs` are informational and non-blocking.)

## Done Criteria
- No failing checks
- No uncovered acceptance criteria and no unresolved `[NEEDS CLARIFICATION]` markers
- Broken traceability links are fixed
