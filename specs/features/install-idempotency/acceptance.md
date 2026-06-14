# Acceptance: install-idempotency

AC→verification map consumed by `coverage:specs`.

| AC | Verification | Test / check (planned) |
|----|--------------|------------------------|
| AC1 | auto | `tests/unit/install-skeleton.test.ts` (existing file skipped, not overwritten) |
| AC2 | auto | `tests/unit/install-skeleton.test.ts` (`--force` overwrites existing file) |
| AC3 | auto | `tests/unit/install-skeleton.test.ts` (populated target → install completes, adapters present) |
| AC4 | auto | `tests/unit/install-skeleton.test.ts` (second run with no `--force` writes nothing) |
| AC5 | auto | `tests/unit/install-skeleton.test.ts` (unknown `--agents` exits non-zero, target unwritten) |
| AC6 | inspect | installer prints `added N, skipped M` summary |
| AC7 | inspect | summary notes `--force` when files were skipped |
| AC8 | auto | the above cases in `tests/unit/install-skeleton.test.ts` |

## Manual verification commands (planned)

```bash
mkdir -p /tmp/proj && echo '{}' > /tmp/proj/tsconfig.json
node scripts/install-sdd-skeleton.mjs --target /tmp/proj --agents claude   # skips tsconfig, completes
node scripts/install-sdd-skeleton.mjs --target /tmp/proj --agents claude   # idempotent
```

## Notes

- `inspect` criteria (summary wording) are verified by reviewing installer output
  during `/sdd-verify` and code review; behavioral criteria are automated.
