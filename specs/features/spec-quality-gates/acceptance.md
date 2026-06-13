# Acceptance: spec-quality-gates

Each acceptance criterion from `feature.spec.md` is mapped to how it will be
verified. Script-backed criteria map to automated tests; convention/doc criteria
map to inspection checks (documented manual verification). This is the AC→test map
the coverage check (AC9) consumes.

> Verification kinds: `auto` = automated test; `inspect` = documented manual
> review of the named artifact; `script` = observable script behavior.

| AC | Verification | Test / check (planned) |
|----|--------------|------------------------|
| AC1 | inspect | `feature.spec.template.md` + `spec-author` SKILL contain the EARS convention |
| AC2 | inspect | template requires `AC<n>` + single behavior + SHALL keyword |
| AC3 | inspect | convention explicitly accepts Given/When/Then form |
| AC4 | inspect | convention lists prohibited soft verbs and the no-compound rule |
| AC5 | inspect | spec-author guidance requires `[NEEDS CLARIFICATION]` over invention |
| AC6 | inspect | `sdd-spec-create.md` instructs listing open markers at end of run |
| AC7 | auto | `tests/unit/check-spec-coverage.test.ts` / validate-spec test: a spec with a marker is reported |
| AC8 | auto | validate-spec test: severity matches the resolved decision (warn vs fail) |
| AC9 | auto | coverage test: matrix lists tasks + tests per AC ID |
| AC10 | auto | coverage test: an AC with no task OR no test is reported uncovered |
| AC11 | auto | coverage test: a task with no AC reference is flagged orphan |
| AC12 | inspect + script | `sdd-verify.md` lists the check; `npm run coverage:specs` runs |
| AC13 | auto | coverage test: uncovered criterion → non-zero exit |
| AC14 | script | `npm run coverage:specs` passes against the migrated demo tree |

## Manual verification commands (planned)

```bash
# Cross-artifact coverage matrix for the demo features
npm run coverage:specs

# Structure validation now also reports unresolved clarification markers
npm run validate:specs
```

## Notes

- AC7/AC8 may be split across the `validate:specs` test and the coverage test
  depending on where marker detection lands; both are automated.
- `inspect` criteria are convention/documentation changes with no runtime
  behavior to assert; they are verified by reviewing the named artifact during
  `/sdd-verify` and code review.
