# Tasks: fresh-install-correctness

> Executable plan from `/sdd-plan`. Ordered, no hidden decisions. Each task lists
> files + the `AC<n>` it covers.

## Design decisions (explicit)

**Zero-features behavior.** In `validate-spec-structure.mjs`, `check-spec-coverage.mjs`,
and `map-spec-to-code.mjs`: when **no `--feature` was requested** and the scan finds
zero feature folders/specs, print a "no features yet" notice and `exit(0)`. When a
specific `--feature` is requested but missing, keep `exit(1)` (that is a real error,
not the empty-project case).

**`.gitignore` merge contract.** Consumer ignore set, in order:
`node_modules/`, `dist/`, `coverage/`, `*.log`, `.DS_Store`.
- Target has no `.gitignore` → write the set (newline-joined, trailing newline).
- Target has a `.gitignore` → read it, compute the set of existing **trimmed** lines,
  append only entries not already present (under a single `# SDD skeleton` comment
  header, added only if at least one entry is appended); never modify/remove existing
  lines; guarantee a newline boundary before appending.
- Idempotent: a second run finds every entry present → file unchanged.
- Excludes the generated-adapter rules (targets commit their adapters).

## Ordered tasks

### Phase 1 — Zero-features = pass + test runner

- [x] **T1** `validate-spec-structure.mjs`: zero feature folders (no `--feature`)
  → notice + `exit(0)`; keep `exit(1)` for a missing requested `--feature`. (AC1, AC4)
- [x] **T2** `check-spec-coverage.mjs`: same zero-features → notice + `exit(0)`. (AC2, AC4)
- [x] **T3** `map-spec-to-code.mjs`: zero specs → notice + `exit(0)`. (AC3, AC4)
- [x] **T4** `vitest.config.ts`: add `test: { passWithNoTests: true }`. (AC5)
- [x] **T5** Tests `tests/unit/spec-scripts-empty.test.ts`: each script run against an
  empty features dir exits 0 with a notice. (AC1, AC2, AC3, AC12)

### Phase 2 — Installer .gitignore merge + scaffold

- [x] **T6** Add a `.gitignore` merge helper (per the contract) — small pure
  function in `scripts/lib/` + a thin writer; wire it into `install-sdd-skeleton.mjs`.
  (AC6, AC7, AC8, AC9)
- [x] **T7** Installer scaffolds `specs/features/`: ship `specs/features/.gitkeep`
  via `skeleton.manifest.json` copy. (AC10)
- [x] **T8** Extend `tests/unit/install-skeleton.test.ts`: gitignore create /
  append-missing-only / idempotent; `specs/features/` present after install. (AC6, AC7, AC8, AC10, AC12)

### Phase 3 — End-to-end + docs

- [x] **T9** End-to-end: fresh default install passes `test` + `validate:specs` +
  `map:specs` + `coverage:specs` (all exit 0). (AC11)
- [x] **T10** Docs: README verification note for empty projects + add
  `coverage:specs` to the commands/checklist; mark Tier A delivered in
  `docs/roadmap.md`. (AC11)
- [x] **T11** Reconcile `acceptance.md` with final test names. (AC12)

## Risks

- **R1** Zero-features pass could mask a real misconfiguration (e.g. wrong
  `--features-dir`). *Mitigation:* only pass when no `--feature` was requested; the
  notice names the scanned dir so a wrong path is visible.
- **R2** `.gitignore` merge corrupting a user's file. *Mitigation:* append-only,
  never rewrite existing lines; idempotent; covered by T8.
- **R3** Empty-dir test flakiness via temp dirs. *Mitigation:* `mkdtemp` + cleanup,
  as in existing tests.
- **R4** `.gitkeep` in `specs/features/` could confuse the spec scripts (a stray
  non-feature entry). *Mitigation:* scripts list **directories** as features; a file
  `.gitkeep` is ignored by `readdirSync(..).filter(isDirectory)`.

## Dependencies

- Phase 1 tasks are independent of each other; T5 depends on T1-T3.
- Phase 2 is independent of Phase 1; T8 depends on T6/T7.
- T9 (e2e) depends on all of Phase 1 + Phase 2.
- No dependency on `src/features/` runtime code.

## Manual verification

```bash
npm run install:skeleton -- --target /tmp/probe --agents claude
cd /tmp/probe && npm install
npm test && npm run validate:specs && npm run map:specs && npm run coverage:specs
```
