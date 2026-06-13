# Acceptance: spec-quality-gates

Each acceptance criterion from `feature.spec.md` is mapped to how it will be
verified. Script-backed criteria map to automated tests; convention/doc criteria
map to inspection checks (documented manual verification). This is the AC→test map
the coverage check (AC9) consumes.

> Verification kinds: `auto` = automated test; `inspect` = documented manual
> review of the named artifact; `script` = observable script behavior.

| AC | Verification | Test / check |
|----|--------------|--------------|
| AC1 | inspect | `specs/templates/feature.spec.template.md` + `docs/spec-authoring.md` + `spec-author` SKILL document the EARS convention |
| AC2 | inspect | template + guide require `AC<n>` + single behavior + SHALL keyword |
| AC3 | inspect | guide explicitly accepts Given/When/Then form |
| AC4 | inspect | guide/template list prohibited soft verbs and the no-compound rule |
| AC5 | inspect | `spec-author` SKILL + `sdd-spec-create.md` require `[NEEDS CLARIFICATION]` over invention |
| AC6 | inspect | `sdd-spec-create.md` instructs listing open markers at end of run |
| AC7 | auto | `tests/unit/spec-parsing.test.ts` (findClarificationMarkers: prose found) |
| AC8 | auto + inspect | `tests/unit/spec-parsing.test.ts` (backtick/fence ignored = warn semantics); `sdd-verify.md` documents the verify-time block |
| AC9 | auto | `tests/unit/check-spec-coverage.test.ts` (matrix lists tasks + verification per AC) |
| AC10 | auto | `tests/unit/check-spec-coverage.test.ts` (no-task and no-verification → uncovered) |
| AC11 | auto | `tests/unit/check-spec-coverage.test.ts` (task with no AC → orphan) |
| AC12 | inspect + script | `sdd-verify.md` lists the check; `npm run coverage:specs` runs |
| AC13 | auto | `tests/unit/check-spec-coverage.test.ts` (uncovered → non-zero exit via computeCoverage) |
| AC14 | script | `npm run coverage:specs` passes against the migrated demo tree (both features 4/4) |

## Manual verification commands

```bash
# Cross-artifact coverage matrix for the demo features
npm run coverage:specs

# Structure validation now also reports unresolved clarification markers
npm run validate:specs
```

## Notes

- Marker-detection logic was extracted to `scripts/lib/spec-parsing.mjs` and is
  tested in `tests/unit/spec-parsing.test.ts`; `validate-spec-structure.mjs`
  consumes it and emits the non-blocking warning (verified by manual run).
- `inspect` criteria are convention/documentation changes with no runtime
  behavior to assert; they are verified by reviewing the named artifact during
  `/sdd-verify` and code review.
