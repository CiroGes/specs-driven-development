---
name: spec-implementer
description: Implement features from approved specs using feature-first structure, preserving traceability and test coverage for acceptance criteria.
---

# Spec Implementer

Use this skill when implementing work from `specs/features/<feature>/`.

## Workflow

1. Read `feature.spec.md`, `tasks.md`, and `acceptance.md`.
2. Implement smallest vertical slice first.
3. Keep implementation under `src/features/<feature>/`.
4. Add or update tests to satisfy acceptance criteria.
5. Verify and update traceability links.

## Required Outputs

- Feature code and exports
- Unit and integration tests
- Updated acceptance evidence

## References

- `references/task-breakdown.md`
- `references/test-strategy.md`
