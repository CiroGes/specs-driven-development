# Specs-Driven Development Skeleton

Specs-Driven Development (SDD) is a workflow where implementation starts from explicit, versioned specifications instead of ad-hoc coding decisions.

In AI-assisted teams this is especially useful because sessions can reset, context can drift, and different contributors can get different outputs for the same request.
SDD reduces that variability by making the source of truth explicit and traceable.

Why this matters:
- Shared understanding before coding (`what` and `why`)
- Consistent execution standards (`how`)
- Clear traceability from spec -> plan -> code -> tests -> retro
- Lower rework and easier review

## Minimal "hello world" starter for specs-driven development with:

- Node.js ESM
- Hybrid TypeScript + JavaScript
- Vitest
- Cursor rules and commands
- Repo-local Codex-style skills
- Product PRD + reusable PRD template
- Minimal MCP server for structured context bundles

## Project Flow

1. Write or update spec files in `specs/features/<feature>/`.
2. Plan tasks from the spec.
3. Implement feature code in `src/features/<feature>/`.
4. Validate with tests and traceability checks.

## Commands

- `npm run hello`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run validate:specs`
- `npm run map:specs`
- `npm run mcp:start`
- `npm run mcp:self-check`

## Repository Structure

- `.cursor/rules`: Cursor behavior constraints and conventions
- `.cursor/commands`: guided commands for SDD workflow
- `.codex/skills`: reusable skills for spec authoring and implementation
- `specs/`: templates and feature specs
- `src/`: feature-first implementation
- `tests/`: unit and integration tests
- `scripts/`: lightweight SDD validation scripts

## Storytelling

- [SDD Storytelling: random-integer-calculator](docs/sdd-storytelling-random-integer-calculator.md) — recommended reading to better understand the end-to-end workflow in practice.

## MCP

- [MCP minimal setup](docs/mcp-minimal.md) — explains how this repository exposes PRD, rules, and feature specs as structured MCP context, including context-bundle tools.

## Product PRD

- [Product PRD (current project)](docs/product-prd.md) — global product requirements document for this repository. It defines vision, goals, scope, constraints, risks, and cross-feature traceability.
- [Product PRD template](specs/templates/product-prd.template.md) — reusable template to bootstrap a PRD in other projects or products following the same structure.

## Feature Delivery Checklist (SDD)

Use this checklist for every new feature.

### 1) Spec

- [ ] Create `specs/features/<feature>/`
- [ ] Complete `feature.spec.md` with:
  - [ ] Context
  - [ ] Problem
  - [ ] Goals
  - [ ] Non-Goals
  - [ ] Scenarios
  - [ ] Acceptance Criteria
  - [ ] Traceability (paths to specs/src/tests)
- [ ] Complete `tasks.md` with ordered, executable tasks
- [ ] Optional: create ADR when architecture decisions are needed

### 2) Implementation

- [ ] Create `src/features/<feature>/`
- [ ] Implement business/domain logic (TS preferred)
- [ ] Implement adapter/orchestration layer (JS/TS per conventions)
- [ ] Expose feature entrypoint in `index.ts`

### 3) Testing

- [ ] Add/update unit tests in `tests/unit/`
- [ ] Add/update integration tests in `tests/integration/`
- [ ] Ensure each acceptance criterion maps to at least one test

### 4) Acceptance and Traceability

- [ ] Complete `specs/features/<feature>/acceptance.md`
- [ ] Map criterion -> test(s) explicitly
- [ ] Verify all Traceability paths exist and are current

### 5) Technical Verification

- [ ] `npm run test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run validate:specs`
- [ ] `npm run map:specs`

### 6) Closeout

- [ ] Update spec/tasks if scope changed during implementation
- [ ] Commit related changes together (`specs/`, `src/`, `tests/`)
- [ ] Use a clear commit message that states functional impact

## Cursor Commands Explained

The files in `.cursor/commands/` are workflow guides for each SDD phase.

### `sdd-init`

Use it when starting a new feature.
It defines the initial context (feature name, problem, constraints) and expects the first feature folder plus initial spec artifacts.

### `sdd-spec-create`

Use it to write or refine `feature.spec.md`.
It ensures required sections are complete: Context, Problem, Goals, Non-Goals, Scenarios, Acceptance Criteria, and Traceability.

### `sdd-plan`

Use it after the spec is stable.
It translates the spec into ordered and executable tasks in `tasks.md`, including risks and dependencies.

### `sdd-implement`

Use it once spec and tasks are approved.
It drives implementation in `src/features/<feature>/`, test creation in `tests/`, and traceability updates in specs.

### `sdd-verify`

Use it before closing the feature.
It confirms quality and consistency checks are green and that traceability links are valid.

### `sdd-retro`

Use it after delivering the feature.
It captures lessons learned and improvements to rules, templates, and commands.

## Example Workflow With Cursor Commands

1. Run `sdd-init` for a new feature (for example `sum-two-integers-console`).
2. Run `sdd-spec-create` and finish all mandatory spec sections.
3. Run `sdd-plan` to produce an implementation-ready `tasks.md`.
4. Run `sdd-implement` to build code and tests aligned with acceptance criteria.  
   Recommended: include explicit inputs instead of invoking it with no context.
   ```txt
   /sdd-implement
   Feature: random-integer-calculator
   Use:
   - specs/features/random-integer-calculator/feature.spec.md
   - specs/features/random-integer-calculator/tasks.md
   Implement only planned tasks and keep traceability updated.
   ```
5. Run `sdd-verify` to validate quality and traceability.
6. Run `sdd-retro` to record improvements for the next feature.
