---
description: Implement an approved feature from feature.spec.md + tasks.md, writing code under src/features/<feature>/ and matching tests under tests/unit/ and tests/integration/, plus required traceability updates in specs/features/<feature>/. This is the ONLY SDD command allowed to modify src/ and tests/. Use once spec and tasks are both approved.
---

# SDD Implement

## Inputs
- Approved `feature.spec.md`
- Approved `tasks.md`

## Expected Output
- Code under `src/features/<feature>/`
- Tests under `tests/`
- Traceability updates in spec documents

## Done Criteria
- Implementation aligns with goals and non-goals
- Unit and integration tests cover acceptance criteria

## Scope Boundaries (Strict)

- This is the only command in the SDD flow that should modify `src/` and `tests/`.
- Allowed changes:
  - `src/features/<feature>/...`
  - `tests/unit/...` and `tests/integration/...`
  - Required traceability updates in `specs/features/<feature>/...`
  - Minimal config/script updates only when strictly required by the approved plan
- Do not alter unrelated features or broad project conventions without explicit approval.
