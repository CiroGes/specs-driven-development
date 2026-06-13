# Retro: spec-quality-gates

Cycle: PRD-anchored benchmark → spec → plan → implement (phases 1-5) → verify.
Delivered the EARS convention, `[NEEDS CLARIFICATION]` markers, and a deterministic
`coverage:specs` gate, dogfooded on the skeleton itself and both demo features.

## What went well

- **Dogfooding surfaced a real design gap.** The spec that *introduces* the
  `[NEEDS CLARIFICATION]` token is full of that token as documentation. Writing it
  first forced the "live marker vs. documentation mention" rule (strip inline-code
  and fenced blocks before scanning) before any code existed. Catching it in the
  spec, not in a bug report, saved a rework loop.
- **Backward-compatible gate enabled clean phasing.** Treating "a spec with no
  `AC<n>` ids" as a no-op pass let `coverage:specs` ship in phase 3, before the
  demo migration in phase 4 — every intermediate commit stayed green.
- **Pure-function extraction made procedural scripts testable.** Moving parsing
  into `scripts/lib/spec-parsing.mjs` turned untestable top-level script code into
  unit-tested functions; the I/O scripts became thin wrappers.
- **Phased commits stayed small and reviewable**, aligned with the repo's Git
  practices (plan / phase 1-2 / phase 3 / phase 4 / phase 5).

## What was tricky

- **"Covered by a test" needed a precise definition.** A literal "every criterion
  has an automated test" would falsely mark documentation/convention criteria
  (verified by review) as uncovered. Resolved to: covered = referenced by ≥1 task
  AND has ≥1 declared verification entry (`auto` / `script` / `inspect`).
- **Matrix readability depended on `T<n>` ids.** Tasks without stable ids produced
  ugly 40-char snippet labels. Stable task ids (already encouraged) double as the
  coverage label.
- **GPG signing timed out once** mid-commit (pinentry); a retry succeeded.
  Environmental, not process — noted for awareness.

## Reusable improvements (promoted)

1. **Parser-vs-documentation rule (promoted to `docs/spec-authoring.md`).** Any
   tooling that parses a marker/syntax must distinguish live usage from
   documentation by stripping code spans and fenced blocks; the feature
   introducing the syntax should stress-test it in its own spec.
2. **Backward-compatible gates (promoted to `docs/conventions.md`).** New spec
   gates must degrade gracefully: content that hasn't opted into a convention
   passes as a no-op, so adopting the skeleton or rolling out a gate never breaks
   existing specs.
3. **Script architecture (promoted to `docs/conventions.md`).** SDD validation
   scripts keep parsing/logic in `scripts/lib/*.mjs` pure functions with unit
   tests; the executable script is a thin I/O + exit-code wrapper.
4. **Acceptance-criteria convention reconciled (`docs/conventions.md`).** The old
   "every criterion maps to an automated test" line is updated to the EARS +
   task + verification-entry rule actually enforced by `coverage:specs`.

## Follow-ups (not done now, deliberately)

- Tier-2 practices remain deferred by design (reviewer subagent, design.md,
  bug-fix workflow) to keep the skeleton easy-to-use.
- Consider a `--strict` flag so `validate:specs` can fail on markers directly,
  if command-level enforcement in `/sdd-verify` proves too soft in practice.
