# Acceptance: fresh-install-correctness

AC→verification map consumed by `coverage:specs`. `auto` = automated test;
`script` = observable script run; `inspect` = documented review.

| AC | Verification | Test / check (planned) |
|----|--------------|------------------------|
| AC1 | auto | `tests/unit/spec-scripts-empty.test.ts` (validate:specs zero features → exit 0) |
| AC2 | auto | `tests/unit/spec-scripts-empty.test.ts` (coverage:specs zero features → exit 0) |
| AC3 | auto | `tests/unit/spec-scripts-empty.test.ts` (map:specs zero features → exit 0) |
| AC4 | auto | existing demo-tree runs of validate/map/coverage stay green (no regression) |
| AC5 | script | `npm test` exits 0 with no test files (`passWithNoTests`) |
| AC6 | auto | `tests/unit/install-skeleton.test.ts` (no `.gitignore` → created with consumer set) |
| AC7 | auto | `tests/unit/install-skeleton.test.ts` (existing `.gitignore` → missing lines appended, existing untouched) |
| AC8 | auto | `tests/unit/install-skeleton.test.ts` (second run is idempotent, no duplicates) |
| AC9 | inspect | merged consumer `.gitignore` excludes `.claude/.agents/.opencode/CLAUDE.md` |
| AC10 | auto | `tests/unit/install-skeleton.test.ts` (`specs/features/` exists after install) |
| AC11 | script | fresh default install passes test + validate:specs + map:specs + coverage:specs |
| AC12 | auto | `spec-scripts-empty.test.ts` + `install-skeleton.test.ts` cover the above |

## Manual verification commands (planned)

```bash
npm run install:skeleton -- --target /tmp/probe --agents claude
cd /tmp/probe && npm install
npm test && npm run validate:specs && npm run map:specs && npm run coverage:specs   # all exit 0
```

## Notes

- AC4 (no regression) is covered by the existing demo-tree verification already run
  in `/sdd-verify`; this feature must not change behavior when features exist.
- `inspect` criteria are reviewed during `/sdd-verify` and code review.
