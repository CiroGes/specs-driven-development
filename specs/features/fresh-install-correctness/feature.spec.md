# Feature: fresh-install-correctness

> Status: implemented. Acceptance criteria in EARS (dogfoods the spec-quality-gates
> convention). Scope = hardening backlog Tier A (A3 rejected: typecheck verified
> green on a fresh target). Verified: fresh default install passes all four commands.

## Context

The skeleton is installed into new or existing projects via
`install:skeleton --target <dir> --agents <list>`. A repo audit found (and this
spec's author verified empirically) that a **default install** (no
`--with-examples`) ships a target whose own verification commands are red until
the user hand-creates a feature:

- `validate:specs`, `coverage:specs`, `map:specs` exit 1 ("No feature folders").
- `npm test` exits 1 (vitest, no test files).
- The target gets **no `.gitignore`** (would stage `node_modules/`).
- `specs/features/` is not created (only `specs/templates/`).

(`typecheck` was also flagged but verified to exit 0 — not a bug, excluded.)

## Problem

The "ready to go" promise is broken on the most common path: a fresh consumer
runs the documented verification commands and sees red, with no signal that this
is the expected empty-project state rather than a misconfiguration.

## Goals

- A fresh default install is **green**: the spec scripts and `npm test` pass
  (exit 0) on a project that has no features yet, with a clear notice.
- The installer ships a sensible consumer `.gitignore`, merging into any existing
  one without clobbering it.
- The installer scaffolds `specs/features/` so the first feature has a home.

## Non-Goals

- Tier B (installer mid-abort on `cpSync` collisions, pre-validating `--agents`,
  conflict pre-scan) — next increment, tracked in `docs/roadmap.md`.
- Tier C/D/E (CRLF parsing, release scripts, CI, engines) — separate increments.
- No change to `tsconfig.json`/typecheck (A3 rejected: verified green).
- No change to the skeleton repo's own scripts behavior when features DO exist
  (the demo tree must still validate/cover exactly as today).

## Scenarios

1. Fresh consumer installs the skeleton, runs `npm install` then
   `npm test && npm run validate:specs && npm run map:specs && npm run coverage:specs`
   — all pass with notices that there are no features yet.
2. Installing into a project that already has a `.gitignore`: the consumer ignore
   entries are appended; the user's existing lines are untouched; re-running adds
   nothing new.
3. After install, `specs/features/` exists and is the documented place to start.

## Acceptance Criteria

### A. Zero-features = pass (A1)

- **AC1** — WHEN `validate:specs` runs and no feature folders exist, the script
  SHALL print a "no features yet" notice and exit 0.
- **AC2** — WHEN `coverage:specs` runs and no feature folders exist, the script
  SHALL print a "no features yet" notice and exit 0.
- **AC3** — WHEN `map:specs` runs and no feature specs exist, the script SHALL
  print a "no features yet" notice and exit 0.
- **AC4** — WHILE at least one feature exists, the three scripts SHALL behave
  exactly as today (no regression to validation, coverage, or mapping).

### B. Test runner (A2)

- **AC5** — WHEN `npm test` runs with no test files, vitest SHALL exit 0 via
  `passWithNoTests`.

### C. Consumer .gitignore (A4)

- **AC6** — WHEN the installer runs and the target has no `.gitignore`, it SHALL
  create one containing `node_modules/`, `dist/`, `coverage/`, `*.log`, `.DS_Store`.
- **AC7** — WHEN the target already has a `.gitignore`, the installer SHALL append
  only the missing entries and SHALL NOT modify or remove existing lines.
- **AC8** — WHEN the installer runs twice against the same target, the `.gitignore`
  result SHALL be identical to the first run (idempotent, no duplicates).
- **AC9** — The consumer `.gitignore` SHALL NOT ignore the generated adapter trees
  (`.claude/`, `.agents/`, `.opencode/`, `CLAUDE.md`), because the target commits
  its projected adapters.

### D. Feature folder scaffold (A5)

- **AC10** — WHEN the installer runs, it SHALL ensure `specs/features/` exists in
  the target (e.g. via a tracked `.gitkeep`).

### E. End-to-end + tests

- **AC11** — A fresh default install (no `--with-examples`) SHALL pass
  `npm test`, `validate:specs`, `map:specs`, and `coverage:specs` (all exit 0).
- **AC12** — Unit tests SHALL cover the zero-features pass path and the
  `.gitignore` merge (create / append-missing / idempotent).

## Traceability

Implementation (`/sdd-implement`) is expected to touch:

- Scripts: `scripts/validate-spec-structure.mjs`, `scripts/check-spec-coverage.mjs`,
  `scripts/map-spec-to-code.mjs` (zero-features → notice + exit 0)
- `vitest.config.ts` (`passWithNoTests: true`)
- Installer: `scripts/install-sdd-skeleton.mjs` (gitignore merge helper +
  `specs/features/.gitkeep` scaffold) — possibly a small shared helper in
  `scripts/lib/`
- Manifest: `skeleton.manifest.json` (ship `specs/features/.gitkeep`; the
  `.gitignore` is produced by merge, not copied)
- Tests: `tests/unit/install-skeleton.test.ts` (extend: gitignore merge),
  `tests/unit/spec-scripts-empty.test.ts` (new: zero-features exit 0)
- Docs: `README.md` (verification checklist note for empty projects; add
  `coverage:specs`), `docs/roadmap.md` (mark Tier A delivered)
- Spec tasks: `specs/features/fresh-install-correctness/tasks.md`
- Acceptance: `specs/features/fresh-install-correctness/acceptance.md`
