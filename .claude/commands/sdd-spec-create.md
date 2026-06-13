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
- A list of every open `[NEEDS CLARIFICATION]` marker at the end of the run

## Convention
- Write acceptance criteria in EARS with stable ids (`AC<n>`), one observable
  behavior each, using SHALL/SHALL NOT (Given/When/Then allowed). No soft verbs,
  no compound criteria. See [docs/spec-authoring.md](../../docs/spec-authoring.md).
- When an input is missing, insert a `[NEEDS CLARIFICATION: <question>]` marker in
  plain prose instead of inventing the answer. Do not wrap a live marker in
  backticks.
- Before finishing, scan the spec and list every open marker so the human can
  resolve them. Resolved markers should be removed (and may be summarized in a
  short "Clarifications (resolved)" note).

## Done Criteria
- Spec includes Context, Problem, Goals, Non-Goals, Scenarios, Acceptance Criteria, Traceability
- Acceptance criteria are in EARS with stable `AC<n>` ids and individually testable
- Open `[NEEDS CLARIFICATION]` markers are surfaced for human resolution

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
