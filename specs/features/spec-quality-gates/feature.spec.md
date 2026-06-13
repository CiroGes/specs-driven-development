# Feature: spec-quality-gates

> Status: spec-authoring phase — clarifications resolved, ready for `/sdd-plan`.
> Acceptance criteria are written in EARS on purpose — this feature dogfoods the
> very convention it introduces.

## Context

This skeleton already has a strong, scriptable traceability story
(`validate:specs` for structure, `map:specs` for spec↔code↔test paths). A
benchmark of the SDD state of the art (GitHub Spec Kit, AWS Kiro, BMAD, Agent OS,
Gentleman Programming's `gentle-pi`/`gentle-ai`, and `betta-tech/harness-sdd`)
showed that:

- **EARS notation** for acceptance criteria is the de facto industry standard
  (Kiro, harness-sdd) and the cleanest way to make criteria testable.
- **Clarification handling** (Spec Kit `[NEEDS CLARIFICATION]` markers; harness-sdd
  "don't invent — block and ask") prevents ambiguous specs from silently driving
  implementation.
- **Cross-artifact coverage** (Spec Kit `/analyze`; harness-sdd reviewer prompt) is
  the one capability the field implements mostly by LLM prompt, not by a
  deterministic, reproducible script — which is exactly where this skeleton can
  lead, because it already owns the scripted-validation infrastructure.

This feature folds those three practices into the existing workflow as a single
coherent increment, deliberately staying "easy-to-use": no new agent commands, no
new heavy concepts, no multi-agent orchestration or IDE hooks.

## Problem

Acceptance criteria are currently free-form prose. Free-form criteria are
ambiguous ("should display clearly"), often compound (several behaviors in one
bullet), and have no stable identifier. As a result:

- The agent fills specification gaps with its own assumptions, causing drift
  between intent, code, and tests.
- The spec↔test mapping is aspirational rather than mechanical: there is no
  reproducible way to prove that every criterion is implemented and tested.
- Underspecified inputs flow unchallenged into `/sdd-plan` and `/sdd-implement`.

## Goals

- Make every acceptance criterion atomic, testable, and individually addressable
  via a stable ID, using an EARS-based convention (Given/When/Then allowed).
- Make spec ambiguity explicit and resolvable before planning, via a lightweight
  `[NEEDS CLARIFICATION]` marker convention plus a non-blocking-to-author /
  blocking-to-implement gate.
- Add a deterministic coverage check that proves each acceptance criterion is
  referenced by at least one task and one test, and surfaces orphans — wired into
  the existing `/sdd-verify` suite.
- Strengthen the skeleton's existing traceability differentiator rather than copy
  the heavier bets of other frameworks.

## Non-Goals

- No multi-agent orchestration (leader/implementer/reviewer), no IDE hooks, no
  persistent custom memory, no per-phase model routing. (Explicitly deferred —
  Tier 2/3 in the benchmark; would break the "easy-to-use" constraint.)
- No mandatory adoption of all five EARS patterns; the convention recommends the
  common subset and allows Given/When/Then.
- No separate `design.md` / data-model / contracts artifacts in this feature.
- No new top-level slash command (e.g. no `/sdd-clarify`, no `/sdd-analyze`);
  behavior is folded into existing commands to avoid command bloat.
- No change to the runtime behavior of the demo application code itself.

## Scenarios

1. **Authoring a criterion.** A spec author writes an acceptance criterion. The
   convention requires a stable ID, a single observable behavior, and the
   SHALL/SHALL NOT keyword (or an equivalent Given/When/Then form).

2. **Hitting a gap.** While drafting, the author needs a fact the inputs do not
   provide (e.g. "is the range inclusive?"). Instead of guessing, they insert a
   `[NEEDS CLARIFICATION: is the 2–200 range inclusive on both ends?]` marker.

3. **Finishing a draft.** `/sdd-spec-create` ends by listing every open
   `[NEEDS CLARIFICATION]` marker so the human can resolve them on review.

4. **Validating structure.** `validate:specs` detects any leftover
   `[NEEDS CLARIFICATION]` marker and reports it, so unresolved questions cannot
   silently reach implementation.

5. **Checking coverage.** The spec-coverage check parses acceptance-criteria IDs
   from the spec, the AC references in `tasks.md`, and the AC→test map in
   `acceptance.md`, then prints a coverage matrix and flags any uncovered
   criterion or orphan task.

6. **Verifying a feature.** `/sdd-verify` runs the coverage check alongside lint,
   typecheck, test, `validate:specs`, and `map:specs`; an uncovered criterion
   fails the suite.

## Acceptance Criteria

Written in EARS with stable IDs. Keyword `SHALL`/`SHALL NOT`. One behavior each.

### A. EARS acceptance-criteria convention

- **AC1** — The skeleton SHALL document an EARS-based acceptance-criteria
  convention in the feature-spec template and in the `spec-author` skill.
- **AC2** — WHEN a spec author writes an acceptance criterion, the convention
  SHALL require a stable identifier (`AC<n>`), exactly one observable behavior,
  and the `SHALL`/`SHALL NOT` keyword.
- **AC3** — The convention SHALL accept a Given/When/Then statement as an
  equivalent alternative form for an individual criterion.
- **AC4** — The convention SHALL prohibit soft verbs ("should", "could",
  "supports") and compound criteria (more than one `SHALL` in a single item).

### B. Clarification markers and gate

- **AC5** — WHEN a spec author encounters information the inputs do not provide,
  the convention SHALL require inserting a `[NEEDS CLARIFICATION: <question>]`
  marker in place of an invented answer.
- **AC6** — WHEN `/sdd-spec-create` completes, it SHALL list every open
  `[NEEDS CLARIFICATION]` marker present in the feature spec.
- **AC7** — WHEN `validate:specs` runs against a feature spec, it SHALL detect and
  report every `[NEEDS CLARIFICATION]` marker it contains.
- **AC8** — WHEN `validate:specs` runs on a spec containing an unresolved
  `[NEEDS CLARIFICATION]` marker, it SHALL emit a non-blocking warning (exit 0),
  while `/sdd-verify` SHALL treat the same unresolved marker as a failure.

### C. Cross-artifact coverage check

- **AC9** — WHEN the spec-coverage check runs for a feature, it SHALL report, for
  each acceptance-criteria ID, the tasks and tests that reference that ID.
- **AC10** — IF an acceptance-criteria ID is referenced by no task, or by no test,
  THEN the check SHALL mark that criterion as uncovered.
- **AC11** — IF a `tasks.md` task references no acceptance-criteria ID THEN the
  check SHALL flag it as an orphan and emit a non-blocking warning (exit 0).
- **AC12** — WHEN `/sdd-verify` runs, it SHALL execute the spec-coverage check as
  part of its validation suite.
- **AC13** — IF any acceptance criterion is uncovered THEN the spec-coverage check
  SHALL exit with a non-zero status.

### D. Backward compatibility of the bundled demo

- **AC14** — The bundled demo specs (`hello-world` and
  `random-integer-calculator`, both of them) SHALL be migrated to the EARS
  convention with stable IDs so that the coverage check passes against the demo
  tree.

## Clarifications (resolved)

These were raised as `[NEEDS CLARIFICATION]` markers and resolved with the human
during spec review (the clarify gate from AC5–AC6 in action):

1. **AC8 — marker severity:** `validate:specs` reports unresolved markers as a
   **non-blocking warning**; `/sdd-verify` treats them as a **failure**. ✔ resolved
2. **AC11 — orphan task:** **warning**, non-blocking (legitimate chore/setup/docs
   tasks may carry no AC). ✔ resolved
3. **AC14 — demo migration:** migrate **both** demo features so the coverage gate
   is green end-to-end. ✔ resolved
4. **Enforcement scope:** scripts check only **stable-ID presence and marker
   absence**. EARS phrasing (SHALL keyword, single behavior, no soft verbs — AC2,
   AC4) stays as **authoring guidance** in the template/skill, NOT a natural-language
   linter, to keep the template easy-to-use and avoid false positives. ✔ resolved

## Planning Notes (from /sdd-plan)

Two interpretations were fixed during planning to remove hidden decisions:

- **"Covered by test" (AC10, AC13):** the coverage script treats `acceptance.md`
  as the declared AC→verification map. An AC is *covered* when it has at least one
  referencing task **and** at least one verification row (`auto`, `script`, or
  `inspect`). The script does NOT confirm a named test physically exists — that is
  already enforced by `npm test`. This refines the word "test" in AC10/AC13 to mean
  "declared verification entry", so documentation/convention criteria (verified by
  `inspect`) are not falsely reported as uncovered.
- **Live marker vs. documentation mention (AC7):** a *live* `[NEEDS CLARIFICATION`
  marker is one appearing in plain prose. Occurrences inside inline code
  (backticks) or fenced code blocks are treated as documentation and ignored. The
  detector strips inline-code spans and fenced blocks before scanning. (This spec
  itself stress-tests that rule: it mentions the token many times as documentation.)

## Traceability

This feature changes the SDD tooling and authoring assets, not `src/features/`.
Implementation (`/sdd-implement`) is expected to touch:

- Templates:
  - `specs/templates/feature.spec.template.md` (EARS guidance + AC ID format +
    marker convention in the Acceptance Criteria section)
  - `specs/templates/tasks.template.md` (tasks reference `AC<n>`)
- Authoring assets:
  - `.claude/commands/sdd-spec-create.md` (marker convention + end-of-run marker
    listing)
  - `.claude/commands/sdd-verify.md` (add coverage check to the suite)
  - `.claude/skills/spec-author/SKILL.md` and `.agents/skills/spec-author/`
    references (EARS + clarification guidance, kept in sync)
- Scripts:
  - `scripts/validate-spec-structure.mjs` (detect `[NEEDS CLARIFICATION]` markers)
  - `scripts/check-spec-coverage.mjs` (new — AC↔task↔test coverage matrix)
  - `package.json` script `coverage:specs` (new)
- Docs:
  - `docs/conventions.md` or a new `docs/spec-authoring.md` (EARS + markers guide)
  - `AGENTS.md` (reference the convention)
- Tests:
  - `tests/unit/check-spec-coverage.test.ts` (coverage script behavior)
- Demo migration (per AC14):
  - `examples/sdd-demo/specs/features/hello-world/*`
  - `examples/sdd-demo/specs/features/random-integer-calculator/*`
- Spec tasks: `specs/features/spec-quality-gates/tasks.md`
- Acceptance: `specs/features/spec-quality-gates/acceptance.md`
