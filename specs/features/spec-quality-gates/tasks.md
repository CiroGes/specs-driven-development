# Tasks: spec-quality-gates

> Executable plan from `/sdd-plan`. Ordered, no hidden decisions. Each task lists
> the files it touches and the acceptance-criteria IDs it covers. Implementation is
> handed to `/sdd-implement` (only that command may modify `scripts/`, `tests/`,
> `package.json`, etc.). Planning-only here.

## Parsing contract (design decisions, made explicit)

The coverage script and the marker detector depend on a fixed, machine-readable
contract. Implementation MUST follow it exactly:

- **AC IDs (in `feature.spec.md`):** an acceptance criterion is a list item whose
  text starts with a bold id `**AC<n>**` inside the `## Acceptance Criteria`
  section. The set of declared IDs = all `AC\d+` matched there.
- **Task → AC references (in `tasks.md`):** a task line declares coverage by
  listing `AC<n>` tokens (any `AC\d+` occurrences on the task line, e.g.
  `(AC1, AC2)`). A task with zero `AC\d+` tokens is an *orphan*.
- **AC → verification map (in `acceptance.md`):** the markdown table whose first
  column is `AC`. An AC is *verification-declared* when it has ≥1 row there with a
  non-empty verification kind (`auto` / `script` / `inspect`).
- **Coverage rule:** an AC is *covered* iff it is referenced by ≥1 task AND is
  verification-declared. Otherwise it is *uncovered*.
- **Live clarification marker:** the literal `[NEEDS CLARIFICATION` appearing in
  prose. Strip inline-code spans (backtick runs) and fenced code blocks first; any
  remaining occurrence is a live marker.

## Ordered tasks

### Phase 1 — Authoring convention (no script yet)

- [ ] **T1.** Add the EARS acceptance-criteria convention to
  `specs/templates/feature.spec.template.md`: the `AC<n>` id format, the
  SHALL/SHALL NOT keyword, one-behavior-per-criterion, the no-soft-verb and
  no-compound rules, and Given/When/Then as an accepted alternative. (AC1, AC2,
  AC3, AC4)
- [ ] **T2.** Add the `[NEEDS CLARIFICATION: <question>]` marker convention to the
  same template (when to use it; that it must be plain prose, not code). (AC1, AC5)
- [ ] **T3.** Make `specs/templates/tasks.template.md` reference `AC<n>` on tasks so
  the task→AC linkage is the default. (AC9)
- [ ] **T4.** Write a short authoring guide `docs/spec-authoring.md` (EARS patterns
  + marker convention + the parsing contract above) and link it from `AGENTS.md`
  key documents. (AC1, AC5)
- [ ] **T5.** Update the `spec-author` skill to teach EARS + markers, keeping
  `.claude/skills/spec-author/` and `.agents/skills/spec-author/` in sync
  (SKILL.md + references). (AC1, AC2, AC5)
- [ ] **T6.** Update `.claude/commands/sdd-spec-create.md`: require markers instead
  of invented answers, and instruct listing all open markers at end of run.
  (AC5, AC6)

### Phase 2 — Marker detection in validate:specs

- [ ] **T7.** Extend `scripts/validate-spec-structure.mjs` to detect live
  `[NEEDS CLARIFICATION` markers per the parsing contract (strip code spans/fences
  first) and report each as a **non-blocking warning** (exit 0). (AC7, AC8)
- [ ] **T8.** Add unit tests `tests/unit/validate-spec-structure.test.ts` covering:
  marker in prose → warning; marker inside backticks/code fence → ignored; no
  marker → clean. (AC7, AC8)

### Phase 3 — Coverage check script

- [ ] **T9.** Implement `scripts/check-spec-coverage.mjs`: parse AC IDs
  (`feature.spec.md`), task→AC refs (`tasks.md`), and AC→verification rows
  (`acceptance.md`) per the parsing contract; print a per-AC coverage matrix
  (criterion → tasks → verification); accept `--features-dir`. (AC9)
- [ ] **T10.** In the same script, mark an AC uncovered when it lacks a task ref or
  a verification row, and flag tasks with no AC ref as orphan **warnings**.
  (AC10, AC11)
- [ ] **T11.** Make the script exit non-zero if any AC is uncovered; exit 0 when
  only orphan-task warnings exist. (AC13)
- [ ] **T12.** Add `tests/unit/check-spec-coverage.test.ts`: fixtures for fully
  covered, missing-task, missing-verification, and orphan-task cases asserting
  matrix output and exit code. (AC9, AC10, AC11, AC13)
- [ ] **T13.** Add the `coverage:specs` npm script (wired to the demo tree like
  `validate:specs`/`map:specs`, i.e. `--features-dir=examples/sdd-demo/specs/features`)
  to `package.json` and to the installer manifest `skeleton.manifest.json`
  packageJson.scripts. (AC12)

### Phase 4 — Wire into verify + demo migration

- [ ] **T14.** Update `.claude/commands/sdd-verify.md` to run `coverage:specs` as
  part of the suite and to treat unresolved markers and uncovered criteria as
  failures (the blocking half of AC8). (AC8, AC12, AC13)
- [ ] **T15.** Migrate `examples/sdd-demo/specs/features/random-integer-calculator/`
  (feature.spec.md acceptance criteria → EARS + `AC<n>`; tasks.md → reference IDs;
  acceptance.md → AC column) and keep its existing tests mapped. (AC14)
- [ ] **T16.** Migrate `examples/sdd-demo/specs/features/hello-world/` the same way.
  (AC14)
- [ ] **T17.** Run `npm run validate:specs`, `npm run map:specs`, and
  `npm run coverage:specs` against the demo tree and confirm green end-to-end.
  (AC12, AC13, AC14)

### Phase 5 — Self-consistency

- [ ] **T18.** Migrate this feature's own `acceptance.md`/`tasks.md` if the final ID
  or table format differs from what was assumed, then run `coverage:specs
  --features-dir=specs/features` to confirm `spec-quality-gates` itself passes.
  (AC9, AC13)
- [ ] **T19.** Final traceability pass: update `acceptance.md` here with the real
  test names produced in T8/T12. (AC9)

## Risks

- **R1 — Marker false positives.** The detector could flag documentation mentions
  of the token. *Mitigation:* the strip-code-spans/fences rule in the parsing
  contract; T8 explicitly tests the backtick/fence cases (this spec is the fixture
  in spirit).
- **R2 — `inspect` criteria treated as uncovered.** If "covered" required a real
  automated test, the many convention/doc ACs (AC1–AC6) would fail the gate.
  *Mitigation:* coverage = task + declared verification row (incl. `inspect`), per
  the Planning Note and parsing contract.
- **R3 — Markdown-table parsing brittleness** in `acceptance.md`. *Mitigation:*
  fix the table contract (first column `AC`); keep parsing tolerant of spacing;
  cover with T12 fixtures.
- **R4 — Skill drift** between `.claude/skills/spec-author/` and
  `.agents/skills/spec-author/`. *Mitigation:* T5 updates both in the same task;
  reviewer/`/sdd-verify` should diff them.
- **R5 — Demo churn.** Migrating both demo features (T15/T16) is the largest edit
  and risks breaking `map:specs`. *Mitigation:* run T17 gate before commit; do not
  touch demo *code/tests*, only spec artifacts.
- **R6 — ESM-only scripts + minimal deps.** New scripts must stay dependency-free
  (no new devDeps), matching the existing `validate-spec-structure.mjs` style.

## Dependencies

- Phase 1 (convention/contract) precedes everything: the scripts in Phases 2–3
  parse the formats Phase 1 fixes.
- T9–T11 (coverage script) depend on the parsing contract (T1, T3) and on
  `acceptance.md` table format.
- T14 (verify wiring) depends on T7 (markers) and T13 (`coverage:specs` script).
- T15–T17 (demo migration + green gate) depend on the convention (Phase 1) and the
  script existing (Phase 3); they are the acceptance gate for AC14.
- No dependency on any `src/features/` runtime code; this feature is tooling +
  authoring assets only.

## Manual verification (per plan convention)

Acceptance includes script-run verification; `acceptance.md` already documents:

```bash
npm run coverage:specs     # AC↔task↔test matrix, fails on uncovered criteria
npm run validate:specs     # now also warns on unresolved [NEEDS CLARIFICATION]
```
