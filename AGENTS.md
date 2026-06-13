# Specs-Driven Development Skeleton — Agent Guide

This file is loaded automatically by Claude Code, Codex, and other agent tools that follow the `AGENTS.md` convention. It captures the operating context, conventions, and SDD workflow for this repository. It is the single source of truth for operating rules, so every agent tool shares the same guidance.

## Project Context

- Project type: Node.js ESM with hybrid TypeScript + JavaScript code.
- Purpose: a minimal, distributable starter for specs-driven development (SDD), reusable across other repositories via the installer.
- Development style: feature-first and specs-driven.
- Source of truth for requirements lives under `specs/features/<feature>/`.
- Any implementation change must keep traceability between spec, code, and tests.

Key documents:

- [docs/product-prd.md](docs/product-prd.md) — product PRD (the explicit starting point)
- [docs/sdd-lifecycle.md](docs/sdd-lifecycle.md) — SDD lifecycle summary
- [docs/conventions.md](docs/conventions.md) — folder/naming conventions
- [docs/spec-authoring.md](docs/spec-authoring.md) — EARS criteria, clarification markers, coverage
- [README.md](README.md) — skeleton overview, installer, and scripts

## Repository Layout

- `.claude/` — Claude Code adapter (`commands/`, `skills/`).
- `.agents/skills/` — Codex-discoverable skills (`release-manager`, `spec-author`, `spec-implementer`).
- `src/features/<feature>/` — feature-first implementation.
- `specs/features/<feature>/` — `feature.spec.md`, `tasks.md`, `acceptance.md`.
- `specs/templates/` — canonical templates for specs, tasks, acceptance, ADR, PRD.
- `examples/sdd-demo/` — self-contained demo project with example specs, code, and tests.
- `scripts/` — SDD validation and installer scripts.
- `tests/` — unit and integration coverage.

## SDD Workflow (Always Apply)

1. Create or update `specs/features/<feature>/feature.spec.md` **before** implementation.
2. Break the feature into actionable tasks in `specs/features/<feature>/tasks.md`.
3. Implement feature-first code under `src/features/<feature>/`.
4. Validate acceptance via tests and `specs/features/<feature>/acceptance.md`.
5. Keep traceability links current between spec, code, and tests at every step.

Phase-by-phase entry points live as slash commands under `.claude/commands/`:

- `/sdd-init` — bootstrap a new feature spec folder (specs-only).
- `/sdd-spec-create` — author a complete `feature.spec.md`.
- `/sdd-plan` — produce `tasks.md` (no code).
- `/sdd-implement` — only this command may modify `src/` and `tests/`.
- `/sdd-verify` — run lint, typecheck, test, validate:specs, map:specs.
- `/sdd-commit` — Conventional Commits message helper.
- `/sdd-retro` — capture lessons learned and reusable improvements.

These slash commands are a Claude Code convenience layer. Codex does not discover `.claude/commands/`; it follows the same workflow from this guide (the SDD Workflow and Scope Boundaries sections) plus the skills below.

Reusable skills live under `.claude/skills/` (Claude Code) and are mirrored to `.agents/skills/` for Codex discovery:

- `spec-author` — create/refine `feature.spec.md` with acceptance + traceability.
- `spec-implementer` — implement from approved specs preserving traceability.
- `release-manager` — automate changelog, version bump, tag, and GitHub release.

## Node + TypeScript/JavaScript Standards (Always Apply)

- Use ESM imports/exports (`"type": "module"`).
- Prefer TypeScript for domain logic and shared contracts.
- Use JavaScript adapters only where interoperability is intentional.
- Keep public feature entrypoints explicit via `index.ts`.
- Keep functions small and deterministic where possible.

## Testing with Vitest (Always Apply)

- Unit tests target pure logic first.
- Integration tests validate flow across adapters and feature entrypoints.
- Every acceptance criterion must map to at least one automated test.
- A feature is not complete without tests for success and edge cases.

Useful scripts:

- `npm run test` — Vitest run
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run validate:specs` — spec structure validation
- `npm run map:specs` — spec ↔ code traceability map

## Git Practices (Always Apply)

- Commit in small, reviewable increments.
- Commit messages must be explicit about spec/code/test impact.
- Do not mix unrelated features in a single commit.
- Keep `specs/`, `src/`, and `tests/` aligned within the same branch.

## Conventional Commits (Always Apply)

Header format: `<type>(<scope>): <description>`. Scope is optional.
Description must be imperative, concise, and lowercase (except acronyms).

Allowed types:

- `feat` — new functionality
- `fix` — bug fix
- `docs` — documentation changes
- `refactor` — internal code changes without behavior changes
- `test` — test additions/changes
- `chore` — maintenance and tooling
- `build` — build/dependency changes
- `ci` — CI/CD changes
- `perf` — performance improvements

Breaking changes: use `!` after type/scope (`feat(api)!: change response format`) **or** a `BREAKING CHANGE:` footer.

Initial commit guidance: prefer `chore(init): bootstrap specs-driven development skeleton`; if it introduces end-user functionality, `feat(init): ...` is acceptable.

## Scope Boundaries Recap

- Spec-authoring commands (`/sdd-init`, `/sdd-spec-create`, `/sdd-plan`) must not touch `src/`, `tests/`, `package.json`, lockfiles, or shared types.
- Only `/sdd-implement` may modify `src/features/<feature>/`, `tests/unit/`, `tests/integration/`, and required traceability updates under `specs/features/<feature>/`.

## Notes

- Start from the PRD, not from `/sdd-init`: define `docs/product-prd.md` from the template before initializing a concrete feature.
- The bundled demo project lives under `examples/sdd-demo/`; the local `validate:specs` and `map:specs` scripts are wired to that example tree.
- This repository is a distributable skeleton: `npm run install:skeleton -- --target ../my-project` copies the reusable adapters (`.claude/`, `.agents/skills/`, `AGENTS.md`) into another repo. Keep the Claude adapter (`.claude/`) and the Codex-discoverable skills (`.agents/skills/`) in sync when changing workflow commands or skills, and update `AGENTS.md` when operating rules change.
