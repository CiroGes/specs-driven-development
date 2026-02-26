# SDD Plan

## Inputs
- Target `feature.spec.md`
- Technical constraints
- Existing architecture notes

## Expected Output
- `tasks.md` with ordered implementation tasks
- Identified risks and dependencies

## Done Criteria
- Tasks are executable without hidden decisions
- Each task references expected files under `src/` or `tests/`

## Scope Boundaries (Strict)

- This command is planning-only.
- Allowed changes:
  - `specs/features/<feature>/tasks.md`
  - Optional planning notes inside `specs/features/<feature>/feature.spec.md`
- Forbidden changes:
  - Any file under `src/`
  - Any file under `tests/`
  - `package.json`, lockfiles, or shared types
- Do not implement code or create tests. Hand off execution to `sdd-implement`.
