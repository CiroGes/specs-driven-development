---
name: spec-author
description: Create and refine feature-first specs for specs-driven development projects, including acceptance criteria and traceability to implementation and tests.
---

# Spec Author

Use this skill when a feature needs a new or updated `feature.spec.md`.

## Workflow

1. Read feature context and constraints.
2. Fill required sections in this order: Context, Problem, Goals, Non-Goals, Scenarios, Acceptance Criteria, Traceability.
3. Write acceptance criteria in EARS with stable ids (`AC<n>`), one observable behavior each, using SHALL/SHALL NOT (Given/When/Then allowed). Avoid soft verbs and compound criteria. See [docs/spec-authoring.md](../../../docs/spec-authoring.md).
4. When an input is missing, insert a `[NEEDS CLARIFICATION: <question>]` marker in plain prose instead of inventing the answer; list all open markers at the end.
5. Link spec to planned code and tests.

## Required Outputs

- `specs/features/<feature>/feature.spec.md`
- `specs/features/<feature>/tasks.md`
- `specs/features/<feature>/acceptance.md`

## References

- See `references/spec-template.md` for required structure.
- See `references/acceptance-checklist.md` for quality checks.
