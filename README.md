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
- A single canonical agent source (`sdd/`) projected into per-agent adapters
- Multi-agent support: Claude Code, Codex, and opencode (pick at install time)
- Product PRD + reusable PRD template

## Project Flow

1. Define or update the product PRD in `docs/product-prd.md`.
2. Write or update feature spec files in `specs/features/<feature>/`.
3. Plan tasks from the feature spec.
4. Implement feature code in `src/features/<feature>/`.
5. Validate with tests and traceability checks.

## Commands

- `npm run install:skeleton -- --target ../my-project` (add `--agents claude,opencode` to pick agents)
- `npm run adapters:build` (regenerate local agent adapters from `sdd/`)
- `npm run hello`
- `npm run random-calc`
- `npm run example:hello`
- `npm run example:random-calc`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run validate:specs`
- `npm run map:specs`
- `npm run coverage:specs`

## Git hooks (optional, no dependencies)

Versioned hooks live in `.githooks/` and are wired via `core.hooksPath` (no Husky):

- **pre-commit** — fast, SDD-specific gates: `lint`, `validate:specs`, `map:specs`,
  `coverage:specs`.
- **pre-push** — heavier: `typecheck`, `test`.

In this repository they are enabled automatically (the `prepare` script runs on
`npm install`). In a project you installed the skeleton into, enable them opt-in:

```bash
npm run hooks:install   # sets core.hooksPath=.githooks
```

Hooks are local and advisory — bypass with `git commit --no-verify` /
`git push --no-verify`. For an authoritative, server-side gate, add CI as well.

## Repository Structure

- `sdd/`: **canonical source of truth** — agent-agnostic command + skill bodies
  (`sdd/commands/`, `sdd/skills/`) plus the projection manifest
  (`sdd/agents.manifest.json`). Edit adapters here.
- `AGENTS.md`: canonical agent guide/rules, read directly by Claude Code, Codex,
  opencode, and other AGENTS.md-aware tools (hand-written, not generated).
- Generated per-agent adapters (git-ignored; produced by `npm run adapters:build`):
  - `.claude/commands` + `.claude/skills` + `CLAUDE.md` (Claude Code)
  - `.agents/skills` (Codex + opencode read it; Codex also gets `agents/openai.yaml`)
  - `.opencode/command` (opencode slash commands)
- `examples/sdd-demo/`: self-contained demo project with example specs, code, tests, and storytelling
- `specs/`: reusable templates for new projects
- `src/`: core repository code that is not part of the demo project
- `tests/`: root-level tests when the skeleton itself needs them
- `scripts/`: SDD validation scripts + the agent-adapter projector

## Storytelling

- [SDD Storytelling: random-integer-calculator](examples/sdd-demo/docs/sdd-storytelling-random-integer-calculator.md) — recommended reading to better understand the end-to-end workflow in practice.

## Product PRD

- [Product PRD (current project)](docs/product-prd.md) — global product requirements document for this repository. It defines vision, goals, scope, constraints, risks, and cross-feature traceability.
- [Product PRD template](specs/templates/product-prd.template.md) — reusable template to bootstrap a PRD in other projects or products following the same structure.

## Start Here

If you are bootstrapping a real project, start with the PRD, not with `sdd-init`.

- First define `docs/product-prd.md` from the PRD template.
- Use `sdd-init` only after the product scope exists and you are ready to initialize a concrete feature under `specs/features/<feature>/`.

## Bootstrap Another Project

Use the installer to copy only the reusable SDD skeleton into another repository.

- Core skeleton, pick agents:
  - `npm run install:skeleton -- --target ../my-project --agents claude,opencode`
  - Without `--agents`: prompts on an interactive terminal, otherwise installs all.
- Include the example features too:
  - `npm run install:skeleton -- --target ../my-project --with-examples`

What gets installed:
- Agent-agnostic assets, always: `AGENTS.md`, `specs/templates/`, `docs/`, SDD
  scripts, TypeScript/ESLint/Vitest config, and SDD `package.json` scripts/devDeps
- Per-agent adapters, only for the agents you select (projected from `sdd/`):
  - `claude` → `.claude/commands`, `.claude/skills`, `CLAUDE.md`
  - `codex` → `.agents/skills` (with `agents/openai.yaml`)
  - `opencode` → `.opencode/command` + skills in `.agents/skills`
- `docs/product-prd.md` generated from the PRD template if it does not already exist

The installer is conservative by default — safe to run on an existing project:
- It never aborts on or overwrites files that already exist; they are skipped and
  reported (`added N, skipped M`). Re-running is idempotent. Pass `--force` to
  overwrite the skipped files.
- It merges `package.json` and `.gitignore`, skipping conflicting/known entries
  with a warning rather than clobbering them.
- Invalid `--agents` values fail before anything is written.

In this repository, the bundled demo project lives under `examples/sdd-demo/`. The local `validate:specs`, `map:specs`, and `coverage:specs` scripts are wired to that example tree. A freshly installed target starts with no features yet: those scripts and `npm test` pass with a "no features yet" notice, and stay green as you add your first feature under `specs/features/<feature>/`.

## Feature Delivery Checklist (SDD)

Use this checklist for every new feature.

### 0) Product Definition

- [ ] Create or update `docs/product-prd.md`
- [ ] Confirm product goals, scope, constraints, and non-goals
- [ ] Make sure the feature you are about to start is in bounds for the PRD

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
- [ ] `npm run coverage:specs`

### 6) Closeout

- [ ] Update spec/tasks if scope changed during implementation
- [ ] Commit related changes together (`specs/`, `src/`, `tests/`)
- [ ] Use a clear commit message that states functional impact

## SDD Commands Explained

The files in `.claude/commands/` are workflow guides for each SDD phase.

### `sdd-init`

Use it when starting a new feature after the PRD already exists.
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

## Example Workflow With SDD Commands

1. Create or update `docs/product-prd.md` from the PRD template.
2. Run `sdd-init` for a new feature (for example `sum-two-integers-console`).
3. Run `sdd-spec-create` and finish all mandatory spec sections.
4. Run `sdd-plan` to produce an implementation-ready `tasks.md`.
5. Run `sdd-implement` to build code and tests aligned with acceptance criteria.  
   Recommended: include explicit inputs instead of invoking it with no context.
   ```txt
   /sdd-implement
   Feature: random-integer-calculator
   Use:
   - examples/sdd-demo/specs/features/random-integer-calculator/feature.spec.md
   - examples/sdd-demo/specs/features/random-integer-calculator/tasks.md
   Implement only planned tasks and keep traceability updated.
   ```
6. Run `sdd-verify` to validate quality and traceability.
7. Run `sdd-retro` to record improvements for the next feature.
