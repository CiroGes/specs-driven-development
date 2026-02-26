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
