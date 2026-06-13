---
description: Author or complete a feature.spec.md with required sections (Context, Problem, Goals, Non-Goals, Scenarios, Acceptance Criteria, Traceability) and testable acceptance criteria. Spec-authoring only — must not modify src/, tests/, package.json, lockfiles, or shared types. Use after /sdd-init when the feature needs its full spec written.
---

# SDD Spec Create

## Inputs
- Feature name
- Business context
- In-scope and out-of-scope boundaries

## Expected Output
- Complete `feature.spec.md` with required sections
- Initial scenario list and acceptance criteria

## Done Criteria
- Spec includes Context, Problem, Goals, Non-Goals, Scenarios, Acceptance Criteria, Traceability
- Acceptance criteria are testable

## Scope Boundaries (Strict)

- This command is documentation-only and spec-authoring-only.
- Allowed changes:
  - `specs/features/<feature>/feature.spec.md`
  - Optional alignment updates in `specs/features/<feature>/acceptance.md`
- Forbidden changes:
  - Any file under `src/`
  - Any file under `tests/`
  - `package.json`, lockfiles, or shared types
- Do not implement code. If asked to implement, hand off to `/sdd-implement`.
