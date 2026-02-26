# SDD Init

## Inputs
- Feature name
- Problem statement
- Constraints

## Expected Output
- New folder in `specs/features/<feature>/`
- Initial `feature.spec.md`, `tasks.md`, and `acceptance.md`

## Done Criteria
- Required spec sections are present
- Feature has a clear initial scope
- Traceability placeholders exist

## Scope Boundaries (Strict)

- This command is documentation-only and specs-only.
- Allowed changes:
  - `specs/features/<feature>/feature.spec.md`
  - `specs/features/<feature>/tasks.md`
  - `specs/features/<feature>/acceptance.md`
- Forbidden changes:
  - Any file under `src/`
  - Any file under `tests/`
  - `package.json`, lockfiles, or shared types
- If implementation is requested, stop and hand off to `sdd-implement`.
