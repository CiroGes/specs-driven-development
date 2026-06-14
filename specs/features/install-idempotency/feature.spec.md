# Feature: install-idempotency

> Status: implemented. Acceptance criteria in EARS (dogfoods the
> spec-quality-gates convention). Scope = hardening backlog Tier B.

## Context

Installing the skeleton into an **existing** project is a primary use case. Today
the installer is inconsistent: adapters skip-and-warn, `package.json` and
`.gitignore` merge, but the raw `copy` loop uses
`cpSync(..., { errorOnExist: !force })`. Verified empirically: installing onto a
project that already has `tsconfig.json` (or any copied asset) **aborts mid-run**
with `EEXIST` and exit 1, after some assets were already written and before
adapters / package.json merge / gitignore merge ever run — a broken partial
install. The only alternative, `--force`, swings the other way and **overwrites**
the user's `tsconfig.json`/`eslint.config.mjs`. Separately, an `--agents` typo is
validated only after the copy loop, so it too leaves a partial install.

## Problem

A conservative install onto an existing project should never abort and never
clobber the user's files; and an invalid `--agents` value should fail before
touching the target. Neither holds today.

## Goals

- Installing (or re-installing) onto a populated project completes without
  aborting, skipping files that already exist instead of failing or overwriting.
- `--force` is the explicit opt-in to overwrite existing files.
- Invalid `--agents` fails fast, before any write.
- The user gets a clear summary of what was added vs skipped.

## Non-Goals

- No interactive confirmation prompt for non-empty targets (keep non-interactive
  installs working; conservative-by-default + summary is enough).
- Tier C/D/E/F (parsers, release scripts, CI, engines) — separate increments.
- No change to the already-conservative paths (adapter projection, `package.json`
  merge, `.gitignore` merge, `generate`): they stay as they are.

## Scenarios

1. Install onto a fresh empty dir → everything written; summary "added N, skipped 0".
2. Install onto a project that already has `tsconfig.json`, `eslint.config.mjs`,
   `package.json` → completes; existing files left untouched; adapters + merges
   still applied; summary "added N, skipped M; pass --force to overwrite".
3. Re-run the same install with no `--force` → no changes (idempotent).
4. Install with `--force` → existing assets overwritten.
5. `install --agents clade` (typo) → errors before writing anything.

## Acceptance Criteria

### A. Skip-existing copy (B1)

- **AC1** — WHEN the installer copies a manifest asset that already exists in the
  target and `--force` is not set, it SHALL skip that file and continue.
- **AC2** — IF `--force` is set THEN the installer SHALL overwrite existing
  manifest assets.
- **AC3** — WHEN a manifest asset already exists in the target, the installer
  SHALL NOT abort; the full flow (assets, adapters, `package.json` merge,
  `.gitignore` merge) SHALL still run to completion.
- **AC4** — WHEN the installer is re-run on an already-installed target without
  `--force`, it SHALL make no file changes (idempotent).

### B. Early agent validation (B2)

- **AC5** — IF `--agents` contains an unknown agent THEN the installer SHALL exit
  non-zero with an error BEFORE writing anything to the target.

### C. Pre-flight / summary (B3)

- **AC6** — WHEN the installer finishes, it SHALL report the count of files added
  versus skipped (already existing).
- **AC7** — IF files were skipped because they exist and `--force` was not set,
  the installer SHALL state that `--force` overwrites them.

### D. Tests

- **AC8** — Tests SHALL cover: install onto a populated target completes without
  abort and leaves existing files untouched; `--force` overwrites; unknown
  `--agents` exits before any write.

## Traceability

Implementation (`/sdd-implement`) is expected to touch:

- `scripts/install-sdd-skeleton.mjs`: recursive skip-existing copy with
  added/skipped tracking (replacing the `cpSync(errorOnExist)` path); early
  `--agents` validation before any write; end-of-run added/skipped summary.
- Tests: `tests/unit/install-skeleton.test.ts` (populated-target completes;
  existing untouched; `--force` overwrites; unknown `--agents` fails pre-write).
- Docs: `README.md` (note conservative-by-default install + `--force`);
  `docs/roadmap.md` (mark Tier B delivered).
- Spec tasks: `specs/features/install-idempotency/tasks.md`
- Acceptance: `specs/features/install-idempotency/acceptance.md`
